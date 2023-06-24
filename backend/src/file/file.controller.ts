import { Module, Controller, Post, UploadedFile, UseGuards, Get, Param, Res, Delete, UseInterceptors, BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage, Multer } from 'multer';
import crypto from 'crypto';
import fs from 'fs';
import path, { extname } from 'path';
import { FileService } from './file.service';
import { GetUser } from "src/decorators";
import { AtGuards } from "src/Authentication/gaurds/at.guards";
import { RolesGuard } from "src/Authentication/gaurds/role.gaurd";
import { Roles } from 'src/decorators/role.auths';
import { Role } from '../decorators/role.enum';
import { Response } from 'express';
import { File } from './model';

// Define file upload options
const uploadOptions = {

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

@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('/upload/:receiverId')
  @UseGuards(AtGuards, RolesGuard)
  @UseInterceptors(FileInterceptor('file', uploadOptions))
  @Roles(Role.USER)
  async uploadFile(@UploadedFile() file: Multer.File, @GetUser() user: number, @Param('receiverId') receiverId: number) {
    // Validate and sanitize input
    if (!file) {
      throw new BadRequestException('No file provided!');
    }
  
    // Encrypt file data
    const encryptedFile = crypto.createCipher('aes-256-cbc', process.env.ENCRYPTION_SECRET_KEY);
    let encryptedData = encryptedFile.update(file.buffer);
    encryptedData = Buffer.concat([encryptedData, encryptedFile.final()]);
  
    // Generate unique filename for encrypted file
    const encryptedFileName = crypto.randomBytes(16).toString('hex');
    const fileExt = extname(file.originalname);
    const encryptedFilePath = path.join(__dirname, '..', 'filestorage', encryptedFileName + fileExt);
  
    // Write encrypted file to file system
    fs.writeFileSync(encryptedFilePath, encryptedData);
  
    // Create new file in the database
    const newFile = await this.fileService.createFile(encryptedFileName + fileExt, file.originalname, user['id'], receiverId, file.mimetype, file.size);
  
    // Return new file object
    return newFile;
  }


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

    const filename = path.join(__dirname, '..', 'filestorage', file.name);
  
    // Read encrypted file from file system
    const encryptedData = fs.readFileSync(filename, 'utf-8');
  
    // Decrypt file data
    const decryptedFile = crypto.createDecipher('aes-256-cbc', process.env.ENCRYPTION_SECRET_KEY);
    let decryptedData = decryptedFile.update(encryptedData, 'hex', 'utf-8');
    decryptedData += decryptedFile.final('utf-8');
  
    // Set appropriate file permissions
    const filePath = path.join(__dirname, '..', 'filestorage', file.originalname);
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