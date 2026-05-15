import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Allow the Next.js frontend to call this API
  app.enableCors({
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'https://work-diary-ai.vercel.app'
    ],
    credentials: true,
  });

  // All routes prefixed with /api
  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT ?? 3001);
  console.log(`🚀 Backend running on: http://localhost:${process.env.PORT ?? 3001}/api`);
}
bootstrap();
