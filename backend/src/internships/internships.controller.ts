import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { InternshipsService } from './internships.service';
import { CreateInternshipDto } from './dto/create-internship.dto';
import { UpdateInternshipDto } from './dto/update-internship.dto';

@Controller('internships')
export class InternshipsController {
  constructor(private readonly internshipsService: InternshipsService) {}

  @Post()
  create(@Body() createInternshipDto: CreateInternshipDto, @Req() req: any) {
    const userId = req.headers['x-user-id'] || req.user?.id || 'mock-user-id';
    return this.internshipsService.create(userId, createInternshipDto);
  }

  @Get()
  findAll(@Req() req: any) {
    const userId = req.headers['x-user-id'] || req.user?.id || 'mock-user-id';
    return this.internshipsService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    const userId = req.headers['x-user-id'] || req.user?.id || 'mock-user-id';
    return this.internshipsService.findOne(id, userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInternshipDto: UpdateInternshipDto, @Req() req: any) {
    const userId = req.headers['x-user-id'] || req.user?.id || 'mock-user-id';
    return this.internshipsService.update(id, userId, updateInternshipDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    const userId = req.headers['x-user-id'] || req.user?.id || 'mock-user-id';
    return this.internshipsService.remove(id, userId);
  }
}
