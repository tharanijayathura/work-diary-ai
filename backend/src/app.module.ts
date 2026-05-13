import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InternshipsModule } from './internships/internships.module';
import { DiaryModule } from './diary/diary.module';
import { ReportsModule } from './reports/reports.module';
import { AiModule } from './ai/ai.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [InternshipsModule, DiaryModule, ReportsModule, AiModule, PrismaModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
