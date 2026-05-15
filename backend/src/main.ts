import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Allow any origin to call this API (robust for multiple Vercel preview URLs)
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // All routes prefixed with /api
  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT ?? 3001);
  console.log(`🚀 Backend running on: http://localhost:${process.env.PORT ?? 3001}/api`);
}
bootstrap();
