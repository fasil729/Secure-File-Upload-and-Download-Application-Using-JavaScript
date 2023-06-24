import { Prisma } from '@prisma/client';

export class File {
  id?: number;
  name: string;
  originalname: string;
  checksum: string;
  encryptionKey: string;
  senderId: number;
  receiverId: number;
  contentType: string;
  size: number;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(name: string, originalname: string, checksum: string, encryptionKey: string, senderId: number, receiverId: number, contentType: string, size: number) {
    this.name = name;
    this.originalname = originalname;
    this.checksum = checksum;
    this.encryptionKey = encryptionKey;
    this.senderId = senderId;
    this.receiverId = receiverId;
    this.contentType = contentType;
    this.size = size;
  }
}