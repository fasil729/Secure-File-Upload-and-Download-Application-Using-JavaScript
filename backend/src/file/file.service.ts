import { PrismaService } from "src/Prisma/prisma.service";
import { File } from './model';
import { Injectable } from "@nestjs/common";
import { ActionLog } from "./action_log.model";



// Define file service
@Injectable()
export class FileService {
    constructor(private prisma: PrismaService) {}
  
    async getFileById(id: number): Promise<File> {
      return this.prisma.file.findUnique({ where: { id } });
    }
  
    async createFile(name: string, originalname: string, senderId: number, receiverId: number, contentType: string, size: number): Promise<File> {
      
      
      const file = await this.prisma.file.create({
        data: {
          name,
          originalname,
          checksum: 'TODO', // Compute checksum here
          encryptionKey: 'TODO', // Generate encryption key here
          senderId,
          receiverId,
          contentType,
          size,
        },
        
      });

      await this.createActionLog('updload', senderId, file.id);
      return file
    }

    async createActionLog(action: string, actionerId: number, fileId: number): Promise<ActionLog> {
      const actioner = await this.prisma.user.findUnique({
        where: { id: actionerId },
      });
  
      const file = await this.prisma.file.findUnique({
        where: { id: fileId },
      });
  
      const actionLog = new ActionLog(action, file, actionerId);
  
      return this.prisma.actionLog.create({
        data: {
          action: actionLog.action,
          timestamp: actionLog.timestamp,
          fileId: file.id,
          
          actionerId: actionLog.actionerId,
        },
        include: {
          file: true
        }
      });
    }
  
    async getActionLogs(): Promise<File[]> {
      console.log("here in get action_logs");
      return this.prisma.file.findMany({
       
        
        include: {
          sender: true,
          receiver:true,
          actionLogs:  {
            include: {
              actioner: true,
              file: true
            }
          },
        },
      });
    }
  
  
    async deleteFileById(id: number): Promise<void> {
      await this.prisma.file.delete({ where: { id } });
    }
  
    async getFilesByReceiverId(receiverId: number): Promise<File[]> {
      return this.prisma.file.findMany({ where: { receiverId } });
    }
  }