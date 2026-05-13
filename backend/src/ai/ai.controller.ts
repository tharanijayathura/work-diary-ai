import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('enhance-diary')
  async enhanceDiary(@Body() body: { text: string; role?: string; company?: string }) {
    if (!body.text || body.text.trim().length === 0) {
      throw new BadRequestException('Text input is required.');
    }

    if (body.text.length > 500) {
      throw new BadRequestException('Text input exceeds the maximum length of 500 characters.');
    }

    const generatedText = await this.aiService.polishDiaryEntry(body.text, body.role, body.company);
    return {
      generatedText,
    };
  }
}
