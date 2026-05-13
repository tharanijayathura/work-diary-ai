import { Module } from '@nestjs/common';
import { DiaryController } from './diary.controller';
import { DiaryService } from './diary.service';
import { AiModule } from '../ai/ai.module';

import { DiarySkillsPreviewController } from './diary-skills-preview.controller';

@Module({
  imports: [AiModule],
  controllers: [DiaryController, DiarySkillsPreviewController],
  providers: [DiaryService],
})
export class DiaryModule {}
