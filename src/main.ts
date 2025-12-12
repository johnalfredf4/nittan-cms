import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Allow frontend origin (Vite: http://localhost:5173)
  app.enableCors({
    origin: ['http://localhost:5173'],  // 🔥 allow your frontend
    methods: 'GET,POST,PUT,PATCH,DELETE',
    credentials: true,
  });

  // Enable body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  await app.listen(3000, '0.0.0.0');
}
bootstrap();
