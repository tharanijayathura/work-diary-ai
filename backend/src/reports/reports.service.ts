import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
const PdfPrinter = require('pdfmake');
import { Document, Paragraph, TextRun, Packer } from 'docx';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: CreateReportDto) {
    return this.prisma.report.create({
      data: {
        ...data,
        userId,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        isPublic: data.isPublic ?? false,
      },
    });
  }

  async findAll(internshipId: string) {
    return this.prisma.report.findMany({
      where: { internshipId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const report = await this.prisma.report.findUnique({
      where: { id },
      include: { internship: true, user: true },
    });
    if (!report) throw new NotFoundException('Report not found');
    return report;
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.report.delete({ where: { id } });
  }

  async generatePdf(id: string): Promise<Buffer> {
    const report = await this.findOne(id);

    const fonts = {
      Helvetica: {
        normal: 'Helvetica',
        bold: 'Helvetica-Bold',
        italics: 'Helvetica-Oblique',
        bolditalics: 'Helvetica-BoldOblique',
      },
    };
    const printer = new PdfPrinter(fonts);

    const docDefinition = {
      content: [
        { text: `Internship Report: ${report.type}`, style: 'header' },
        { text: `Company: ${report.internship.companyName}`, style: 'subheader' },
        { text: `Role: ${report.internship.role}`, style: 'subheader' },
        {
          text: `Period: ${report.startDate.toISOString().split('T')[0]} to ${report.endDate.toISOString().split('T')[0]}\n\n`,
        },
        { text: 'Content', style: 'subheader' },
        { text: report.content },
      ],
      styles: {
        header: { fontSize: 22, bold: true, margin: [0, 0, 0, 10] as [number, number, number, number] },
        subheader: { fontSize: 16, bold: true, margin: [0, 10, 0, 5] as [number, number, number, number] },
      },
      defaultStyle: { font: 'Helvetica' },
    };

    return new Promise((resolve, reject) => {
      try {
        const pdfDoc = printer.createPdfKitDocument(docDefinition);
        const chunks: any[] = [];
        pdfDoc.on('data', (chunk: any) => chunks.push(chunk));
        pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
        pdfDoc.end();
      } catch (err) {
        reject(err);
      }
    });
  }

  async generateDocx(id: string): Promise<Buffer> {
    const report = await this.findOne(id);

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [new TextRun({ text: `Internship Report: ${report.type}`, bold: true, size: 32 })],
            }),
            new Paragraph({
              children: [new TextRun({ text: `Company: ${report.internship.companyName}`, bold: true, size: 24 })],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Period: ${report.startDate.toISOString().split('T')[0]} to ${report.endDate.toISOString().split('T')[0]}`,
                  size: 20,
                }),
              ],
            }),
            new Paragraph({ text: '' }),
            new Paragraph({
              children: [new TextRun({ text: report.content, size: 24 })],
            }),
          ],
        },
      ],
    });

    return await Packer.toBuffer(doc);
  }
}
