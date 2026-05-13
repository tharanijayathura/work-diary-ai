export class CreateInternshipDto {
  companyName: string;
  role: string;
  supervisor?: string;
  description?: string;
  startDate: string; // ISO date string
  endDate?: string;
  skills?: string[];
  status?: string;
}
