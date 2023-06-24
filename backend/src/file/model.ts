import { Prisma } from '@prisma/client';

export class File {
  id?: number;
  name: string;
  data: Buffer;
  checksum: string;
  encryptionKey: string;
  senderId: number;
  receiverId: number;
  contentType: string;
  size: number;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(name: string, data: Buffer, checksum: string, encryptionKey: string, senderId: number, receiverId: number, contentType: string, size: number) {
    this.name = name;
    this.data = data;
    this.checksum = checksum;
    this.encryptionKey = encryptionKey;
    this.senderId = senderId;
    this.receiverId = receiverId;
    this.contentType = contentType;
    this.size = size;
  }
}