import { Controller, Get, Post, Body, Param, Delete, Query, Req, Res, HttpCode, HttpStatus } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import type { Response } from 'express';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createReportDto: CreateReportDto, @Req() req: any) {
    const userId = req.user?.id || 'mock-user-id';
    return this.reportsService.create(userId, createReportDto);
  }

  @Get()
  findAll(@Query('internshipId') internshipId: string) {
    if (!internshipId) return [];
    return this.reportsService.findAll(internshipId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reportsService.findOne(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.reportsService.remove(id);
  }

  @Get(':id/export/pdf')
  async exportPdf(@Param('id') id: string, @Res() res: Response) {
    const buffer = await this.reportsService.generatePdf(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="report-${id}.pdf"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  @Get(':id/export/docx')
  async exportDocx(@Param('id') id: string, @Res() res: Response) {
    const buffer = await this.reportsService.generateDocx(id);
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="report-${id}.docx"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }
}
