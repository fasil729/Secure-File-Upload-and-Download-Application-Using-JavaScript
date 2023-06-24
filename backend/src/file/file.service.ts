import { PrismaService } from "src/Prisma/prisma.service";
import { File } from './model';

// Define file service
export class FileService {
    constructor(private readonly prisma: PrismaService) {}
  
    async getFileById(id: number): Promise<File> {
      return this.prisma.file.findUnique({ where: { id } });
    }
  
    async createFile(name: string, originalname: string, senderId: number, receiverId: number, contentType: string, size: number): Promise<File> {
      return this.prisma.file.create({
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
    }
  
    async deleteFileById(id: number): Promise<void> {
      await this.prisma.file.delete({ where: { id } });
    }
  
    async getFilesByReceiverId(receiverId: number): Promise<File[]> {
      return this.prisma.file.findMany({ where: { receiverId } });
    }
  }