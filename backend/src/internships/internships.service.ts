import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInternshipDto } from './dto/create-internship.dto';
import { UpdateInternshipDto } from './dto/update-internship.dto';

@Injectable()
export class InternshipsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: CreateInternshipDto) {
    return this.prisma.internship.create({
      data: {
        ...data,
        userId,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        skills: data.skills ?? [],
        status: data.status ?? 'ACTIVE',
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.internship.findMany({
      where: { userId },
      orderBy: { startDate: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const internship = await this.prisma.internship.findFirst({
      where: { id, userId },
    });
    if (!internship) throw new NotFoundException('Internship not found');
    return internship;
  }

  async update(id: string, userId: string, data: UpdateInternshipDto) {
    await this.findOne(id, userId); // ensure ownership
    return this.prisma.internship.update({
      where: { id },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId); // ensure ownership
    return this.prisma.internship.delete({ where: { id } });
  }
}
