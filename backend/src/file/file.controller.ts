import { Module, Controller, Post, UploadedFile, UseGuards, Get, Param, Res, Delete, UseInterceptors, BadRequestException, NotFoundException, UnauthorizedException, ParseIntPipe, Headers, UseFilters, HttpException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage, Multer } from 'multer';
import * as crypto from 'crypto';
import * as fs from 'fs';
// import path, { extname } from 'path';
import * as path from 'path';
import { FileService } from './file.service';
import { GetUser } from "src/decorators";
import { AtGuards } from "src/Authentication/gaurds/at.guards";
import { RolesGuard } from "src/Authentication/gaurds/role.gaurd";
import { Roles } from 'src/decorators/role.auths';
import { Role } from '../decorators/role.enum';
import { Response } from 'express';
import { File } from './model';
import { FileValidationFilter } from './file.badResponse';

// Define file upload options
const uploadOptions = {
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(pdf|jpg|jpeg|png|gif)$/)) {
      console.log("not allowing format")
      return cb(new HttpException('Only PDF and image files are allowed!', 400), false);
    }
    cb(null, true);
  },
  limits: {
    fileSize: 1024 * 1024, // 1 MB
  },
};

@Controller('file')
export class FileController {
  constructor(private fileService: FileService) {}
  private readonly encryptionKey = '0123456789abcdef0123456789abcdef'; // 32-byte encryption key in hex format
  private readonly iv = crypto.randomBytes(16);

  @Post('/upload/:receiverId')
@UseGuards(AtGuards, RolesGuard)
@UseInterceptors(FileInterceptor('file'))
@Roles(Role.USER)
// @UseFilters(FileValidationFilter)
async uploadFile(
  @UploadedFile() file: Multer.File,
  @GetUser() user: number,
  @Param('receiverId', ParseIntPipe) receiverId: number,
  @Headers('x-file-hmac') fileHMAC: string // <- Add header name and default value
) {
  // Handler logic goes here

    // Validate and sanitize input
    if (!file) {
      throw new BadRequestException('No file provided!');
    }

    if (!file.originalname.match(/\.(pdf|jpg|jpeg|png|gif)$/)) {
      throw new BadRequestException('Only PDF and image files are allowed!');
    }

    if(file.size > 1024 * 1024 * 10){
      throw new BadRequestException('Only files less than 10 MB are allowed!')
    }
    const encryptionKey = Buffer.from('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef', 'hex');
    // Calculate HMAC to check file integrity
    // const hmac = crypto.createHmac('sha256', encryptionKey);
    // hmac.update(file.buffer);
    // const calculatedChecksum = hmac.digest('hex');
    // console.log("checksum",calculatedChecksum);
    // console.log("fiel mac")
    // console.log(file.buffer)
    // console.log(fileHMAC)
    // // Verify file integrity
    // if (calculatedChecksum !== fileHMAC) {
    //   throw new BadRequestException('File integrity check failed!');
    // }
    // console.log("original buffer")
    // console.log(file.buffer);
    const cipher = crypto.createCipheriv('aes-256-cbc', this.encryptionKey, this.iv);
    let encryptedData = cipher.update(file.buffer);
    encryptedData = Buffer.concat([encryptedData, cipher.final()]);
    console.log(encryptedData);

    // Generate unique filename for encrypted file

    const encryptedFileName = crypto.randomBytes(16).toString('hex');
    const fileExt = path.extname(file.originalname);
    const encryptedFilePath = path.join(__dirname, '../../../', 'filestorage', encryptedFileName + fileExt);
  
    // Write encrypted file to file system
    fs.writeFileSync(encryptedFilePath, encryptedData);
    //console.log(typeof user['id'], typeof receiverId, "here to see reciverid and userid");
  
    // Create new file in the database
    const newFile = await this.fileService.createFile(encryptedFileName + fileExt, file.originalname, user['id'], receiverId, file.mimetype, file.size);
  
    // Return new file object
    return newFile;
  }


  @Get('download/:id')
  @UseGuards(AtGuards, RolesGuard)
  @Roles(Role.USER)
  async downloadFile(@Param('id', ParseIntPipe) id: number, @GetUser() user: number, @Res() res: Response) {

    // create action_logs
    await this.fileService.createActionLog('download', user['id'], id);
    // Find file by ID
    const file = await this.fileService.getFileById(id);
  
    // Validate permissions
    if (!file) {
      throw new NotFoundException('File not found!');
    }
    if (file.senderId !== user['id'] && file.receiverId !== user['id']) {
      throw new UnauthorizedException('You are not authorized to access this file!');
    }
    const filename = path.join(__dirname, '../../../', 'filestorage', file.name);
  
    // Read encrypted file from file system
    const encryptedData = fs.readFileSync(filename);

    // Decrypt file data
    const decipher = crypto.createDecipheriv('aes-256-cbc', this.encryptionKey, this.iv);
  let decryptedData = decipher.update(encryptedData);
  console.log(encryptedData);
  decryptedData = Buffer.concat([decryptedData, decipher.final()]);
  // Set appropriate file permissions
  const fileBuffer = Buffer.from(decryptedData);
  console.log("final download decrypted data", fileBuffer);
    // Set appropriate file permissions
    const filePath = path.join(__dirname, '../../../', 'filestorage', file.originalname);
    fs.writeFileSync(filePath, decryptedData);
    // const hmac = crypto.createHmac('sha256', this.encryptionKey)
    // .update(decryptedData)
    // .digest('hex');
    res.setHeader('Content-Type', file.contentType, 

    );
    // res.setHeader('X-File-HMAC',  hmac);
    res.download(filePath, file.originalname, (err) => {
      if (err) {
        throw new NotFoundException('File not found!');
      }
      fs.unlinkSync(filePath);
    });
  }
  @Get('received')
  @UseGuards(AtGuards, RolesGuard)
  @Roles(Role.USER)
  async getReceivedFiles(@GetUser() user: Map<String, any>): Promise<File[]> {
    return await this.fileService.getFilesByReceiverId(parseInt(user['id']));
  }

// to show the file on the browser not download
@Get(':id/retrieve')
@UseGuards(AtGuards)
async viewFile(@Param('id', ParseIntPipe) id: number, @GetUser() user: number, @Res() res: Response) {
  
  // create action_logs
  await this.fileService.createActionLog('retrieve', user['id'], id);
  
  // Find file by ID
  const file = await this.fileService.getFileById(id);

  // Validate permissions
  if (!file) {
    throw new NotFoundException('File not found!');
  }
  if (file.senderId !== user['id'] && file.receiverId !== user['id']) {
    throw new UnauthorizedException('You are not authorized to access this file!');
  }

  const filename = path.join(__dirname, '../../../', 'filestorage', file.name);
  // Read encrypted file from file system
  const encryptedData = fs.readFileSync(filename);

  const decipher = crypto.createDecipheriv('aes-256-cbc', this.encryptionKey, this.iv);
  let decryptedData = decipher.update(encryptedData);
  console.log(encryptedData);
  decryptedData = Buffer.concat([decryptedData, decipher.final()]);
  // Set appropriate file permissions
  const fileBuffer = Buffer.from(decryptedData);
  // const hmac = crypto.createHmac('sha256', this.encryptionKey)
  //     .update(decryptedData)
  //     .digest('hex');
  res.setHeader('Content-Type', file.contentType, 
  
  );
  // res.setHeader('X-File-HMAC',  hmac);

  res.send(fileBuffer);
}
  // Delete file endpoint
  @Delete(':id')
  @UseGuards(AtGuards, RolesGuard)
  @Roles(Role.USER)
  async deleteFile(@Param('id', ParseIntPipe) id: number, @GetUser() user: number) {

    // create action_logs
    await this.fileService.createActionLog('delete', user['id'], id);
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
    const filePath = path.join(__dirname, '../../../', 'filestorage', file.name);
    await this.fileService.deleteFileById(id);
    fs.unlinkSync(filePath);
  }




  @Get('/action_logs')
  @UseGuards(AtGuards, RolesGuard)
  @Roles(Role.ADMIN)
  async retrieveFileLogs() {
   
    const actionLogs = await this.fileService.getActionLogs();

    return actionLogs
  }
}