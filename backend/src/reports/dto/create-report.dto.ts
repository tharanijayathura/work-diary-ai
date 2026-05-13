export class CreateReportDto {
  internshipId: string;
  type: string; // WEEKLY | MONTHLY | FINAL
  content: string;
  startDate: string; // ISO date string
  endDate: string;   // ISO date string
  fileUrl?: string;
  isPublic?: boolean;
}
