/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { FileValidationFilter } from './file/file.badResponse';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({whitelist:true}));
  app.enableCors();
  app.useGlobalFilters(new FileValidationFilter());
  await app.listen(3000);
}
bootstrap();
