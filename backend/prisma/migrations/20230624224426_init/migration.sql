-- DropIndex
DROP INDEX `File_receiverId_fkey` ON `file`;

-- DropIndex
DROP INDEX `File_senderId_fkey` ON `file`;

-- AddForeignKey
ALTER TABLE `File` ADD CONSTRAINT `File_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `File` ADD CONSTRAINT `File_receiverId_fkey` FOREIGN KEY (`receiverId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
