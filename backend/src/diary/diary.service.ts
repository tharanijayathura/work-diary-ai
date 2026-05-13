import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDiaryEntryDto } from './dto/create-diary-entry.dto';
import { UpdateDiaryEntryDto } from './dto/update-diary-entry.dto';

@Injectable()
export class DiaryService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateDiaryEntryDto) {
    return this.prisma.diaryEntry.create({
      data: {
        ...data,
        entryDate: new Date(data.entryDate),
        skills: data.skills ?? [],
        attachments: data.attachments ?? [],
      },
    });
  }

  async findAll(internshipId: string) {
    return this.prisma.diaryEntry.findMany({
      where: { internshipId },
      orderBy: { entryDate: 'desc' },
    });
  }

  async findOne(id: string) {
    const entry = await this.prisma.diaryEntry.findUnique({ where: { id } });
    if (!entry) throw new NotFoundException('Diary entry not found');
    return entry;
  }

  async update(id: string, data: UpdateDiaryEntryDto) {
    await this.findOne(id); // ensure exists
    return this.prisma.diaryEntry.update({
      where: { id },
      data: {
        ...data,
        entryDate: data.entryDate ? new Date(data.entryDate) : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id); // ensure exists
    return this.prisma.diaryEntry.delete({ where: { id } });
  }
}
