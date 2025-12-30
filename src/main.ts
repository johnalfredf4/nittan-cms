import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as express from 'express';

async function bootstrap() {
  // 🔑 IMPORTANT: type the app as NestExpressApplication
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Allow frontend origin
  app.enableCors({
    origin: ['http://localhost:5173', 'http://10.254.0.3'],
    methods: 'GET,POST,PUT,PATCH,DELETE',
    credentials: true,
  });

  // Serve static files (Tailwind CSS)
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    cacheControl: false, // dev-friendly
  });

  // Body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  await app.listen(3000, '0.0.0.0');
}
bootstrap();
