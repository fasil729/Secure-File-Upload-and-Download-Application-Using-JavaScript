import { Module, Controller, Post, UploadedFile, UseGuards, Get, Param, Res, Delete, UseInterceptors, BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import crypto from 'crypto';
import fs from 'fs';
import path, { extname } from 'path';
import { FileService } from './file.service';
import { GetUser } from "src/decorators";
import { AtGuards } from "src/Authentication/guards/at.guards";
import { RolesGuard } from "src/Authentication/guards/role.guards";
import { Roles } from 'src/decorators/role.auths';
import { Role } from '../decorators/role.enum';
import { Response } from 'express';
import { File } from './model';

// Define file upload options
const uploadOptions = {
  storage: diskStorage({
    destination: './filestorage',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const encryptedFileName = crypto.randomBytes(16).toString('hex');
      const fileExt = extname(file.originalname);
      cb(null, encryptedFileName + uniqueSuffix + fileExt);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(pdf|jpg|jpeg|png|gif)$/)) {
      return cb(new BadRequestException('Only PDF and image files are allowed!'));
    }
    cb(null, true);
  },
  limits: {
    fileSize: 1024 * 1024, // 1 MB
  },
};

@Controller('files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  // Upload file endpoint
  @Post('upload/:receiverId')
  @UseGuards(AtGuards, RolesGuard)
  @Roles(Role.USER)
  @UseInterceptors(FileInterceptor('file', uploadOptions))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @GetUser() user: number, @Param('receiverId') receiverId: number) {
    // Validate and sanitize input
    if (!file) {
      throw new BadRequestException('No file provided!');
    }

    // Encrypt file data
    const encryptedFile = crypto.createCipher('aes-256-cbc', process.env.ENCRYPTION_SECRET_KEY);
    let encryptedData = encryptedFile.update(file.buffer);
    encryptedData = Buffer.concat([encryptedData, encryptedFile.final()]);

    // Create new file in the database
    const encryptedFileName = path.basename(file.filename, path.extname(file.filename));
    const newFile = await this.fileService.createFile(encryptedFileName, file.originalname, user['id'], receiverId, file.mimetype, file.size, encryptedData);

    // Return new file object
    return newFile;
  }

  // Download file endpoint
  @Get(':id/download')
  @UseGuards(AtGuards, RolesGuard)
  @Roles(Role.USER)
  async downloadFile(@Param('id') id: number, @GetUser() user: number, @Res() res: Response) {
    // Find file by ID
    const file = await this.fileService.getFileById(id);

    // Validate permissions
    if (!file) {
      throw new NotFoundException('File not found!');
    }
    if (file.senderId !== user['id'] && file.receiverId !== user['id']) {
      throw new UnauthorizedException('You are not authorized to access this file!');
    }

    // Decrypt file data
    const decryptedFile = crypto.createDecipher('aes-256-cbc', process.env.ENCRYPTION_SECRET_KEY);
    let decryptedData = decryptedFile.update(file.data);
    decryptedData = Buffer.concat([decryptedData, decryptedFile.final()]);

    // Set appropriate file permissions
    const filePath = path.join(__dirname, '..', 'filestorage', file.name);
    fs.writeFileSync(filePath, decryptedData);
    res.download(filePath, file.originalname, (err) => {
      if (err) {
        throw new NotFoundException('File not found!');
      }
      fs.unlinkSync(filePath);
    });
  }

  // Delete file endpoint
  @Delete(':id')
  @UseGuards(AtGuards, RolesGuard)
  @Roles(Role.USER)
  async deleteFile(@Param('id') id: number, @GetUser() user: number) {
    // Find file by ID
    const file = await this.fileService.getFileById(id);

    // Validate permissions
    if (!file) {
      throw new NotFoundException('File not found!');
    }
    if (file.senderId !== user['id']) {
      throw new UnauthorizedException('You are not authorized to delete this file!');
    }

    // Delete file from the database and file system
    const filePath = path.join(__dirname, '..', 'filestorage', file.name);
    await this.fileService.deleteFileById(id);
    fs.unlinkSync(filePath);
  }

  // Get files received by authenticated user
  @Get('received')
  @UseGuards(AtGuards, RolesGuard)
  @Roles(Role.USER)
  async getReceivedFiles(@GetUser() user: number): Promise<File[]> {
    return await this.fileService.getFilesByReceiverId(user['id']);
  }
}