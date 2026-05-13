import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { DiaryService } from './diary.service';
import { AiService } from '../ai/ai.service';
import { CreateDiaryEntryDto } from './dto/create-diary-entry.dto';
import { UpdateDiaryEntryDto } from './dto/update-diary-entry.dto';

@Controller('diary')
export class DiaryController {
  constructor(
    private readonly diaryService: DiaryService,
    private readonly aiService: AiService,
  ) {}

  /**
   * POST /diary
   * Create a new diary entry.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDiaryDto: CreateDiaryEntryDto) {
    return this.diaryService.create(createDiaryDto);
  }

  /**
   * GET /diary?internshipId=<id>
   * Return all diary entries for a given internship (newest first).
   */
  @Get()
  findAll(@Query('internshipId') internshipId: string) {
    if (!internshipId) return [];
    return this.diaryService.findAll(internshipId);
  }

  /**
   * GET /diary/:id
   * Return a single diary entry by ID.
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.diaryService.findOne(id);
  }

  /**
   * PATCH /diary/:id
   * Update a diary entry (partial fields).
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDiaryDto: UpdateDiaryEntryDto) {
    return this.diaryService.update(id, updateDiaryDto);
  }

  /**
   * DELETE /diary/:id
   * Delete a diary entry permanently.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.diaryService.remove(id);
  }

  // ─── AI Endpoints ─────────────────────────────────────────────────────────

  /**
   * POST /diary/:id/polish
   * AI-polish the rough notes and save to `content`.
   * Also detects and saves skills automatically.
   */
  @Post(':id/polish')
  async polish(@Param('id') id: string) {
    const entry = await this.diaryService.findOne(id);

    if (!entry.roughNotes) {
      throw new BadRequestException(
        'This entry has no rough notes to polish. Add rough notes first.',
      );
    }

    const internship = (entry as any).internship;
    const role = internship?.role || '';
    const company = internship?.companyName || '';

    const [polishedContent, detectedSkills] = await Promise.all([
      this.aiService.polishDiaryEntry(entry.roughNotes, role, company),
      this.aiService.detectSkills(entry.roughNotes, role),
    ]);

    return this.diaryService.update(id, {
      content: polishedContent,
      skills: detectedSkills,
      isDraft: false,
    });
  }

  /**
   * POST /diary/:id/detect-skills
   * Re-run skill detection on existing content.
   */
  @Post(':id/detect-skills')
  async detectSkills(@Param('id') id: string) {
    const entry = await this.diaryService.findOne(id);
    const text = entry.content || entry.roughNotes || '';

    if (!text) {
      throw new BadRequestException('Entry has no content for skill detection.');
    }

    const internship = (entry as any).internship;
    const role = internship?.role || '';
    const detectedSkills = await this.aiService.detectSkills(text, role);
    return this.diaryService.update(id, { skills: detectedSkills });
  }
}
