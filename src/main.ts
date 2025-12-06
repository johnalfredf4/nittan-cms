import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🚀 ENABLE BODY PARSING FOR JSON
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.setGlobalPrefix('api');
  await app.listen(3000);
}
bootstrap();
