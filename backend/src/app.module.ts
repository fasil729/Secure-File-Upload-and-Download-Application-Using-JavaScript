/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './Authentication/Auth.module';
import { PrismaModule } from './Prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { FileModule } from './file/file.module';



@Module({
  imports: [ AuthModule,PrismaModule,FileModule,ConfigModule.forRoot({isGlobal:true})],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
