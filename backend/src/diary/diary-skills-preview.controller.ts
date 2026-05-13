import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { AiService } from '../ai/ai.service';

@Controller('diary')
export class DiarySkillsPreviewController {
  constructor(private readonly aiService: AiService) {}

  /**
   * Temporary preview detection route for interactive workflow
   */
  @Post('detect-skills-preview')
  async detectSkillsPreview(@Body() body: { text: string; role?: string }) {
    if (!body.text) {
      throw new BadRequestException('Text is required.');
    }
    const detectedSkills = await this.aiService.detectSkills(body.text, body.role);
    return detectedSkills;
  }
}
