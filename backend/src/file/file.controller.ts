import { Module, Controller, Post, UploadedFile, UseGuards, Get, Param, Res, Delete, UseInterceptors, BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import path, { extname } from 'path'
import { FileService } from './file.service';
import { GetUser } from "src/decorators";
import { AtGuards } from "src/Authentication/gaurds/at.guards";
import { RolesGuard } from "src/Authentication/gaurds/role.gaurd";
import { Roles } from 'src/decorators/role.auths';
import { Role } from '../decorators/role.enum';
import { Response } from 'express'
import { File } from './model';



// Define file upload options
const uploadOptions = {
    storage: diskStorage({
      destination: './files',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + extname(file.originalname));
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
  @Post('upload')
  @UseGuards(AtGuards, RolesGuard)
  @Roles(Role.USER)
  @UseInterceptors(FileInterceptor('file', uploadOptions))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @GetUser() user: number) {
    // Validate and sanitize input
    if (!file) {
      throw new BadRequestException('No file provided!');
    }

    // Create new file in the database
    const newFile = await this.fileService.createFile(file.filename, file.buffer, user['id'], 1, file.mimetype, file.size);

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

    // Set appropriate file permissions
    res.set('Content-Disposition', `attachment; filename=${file.name}`);
    res.set('Content-Type', file.contentType);
    res.set('Content-Length', file.size.toString());

    // Prevent directory traversal attacks
    const safePath = path.join(__dirname, '..', 'files', file.name);
    res.sendFile(safePath);
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
    if (file.senderId !== user['id'] && file.receiverId !== user['id']) {
      throw new UnauthorizedException('You are not authorized to delete this file!');
    }

    // Delete file from database and file system
    await this.fileService.deleteFileById(id);
    const filePath = path.join(__dirname, '..', 'files', file.name);
    fs.unlinkSync(filePath);
  }

  // Send file endpoint
  @Get('send/:receiverId')
  @UseGuards(AtGuards, RolesGuard)
  @Roles(Role.USER)
  async sendFile(@Param('receiverId') receiverId: number, @GetUser() user: number) {
    // Get all files for the receiver
    const files = await this.fileService.getFilesByReceiverId(receiverId);

    // Validate permissions
    if (user['id'] !== receiverId) {
      throw new UnauthorizedException('You are not authorized to access these files!');
    }

    // Return files array
    return files;
  }
}