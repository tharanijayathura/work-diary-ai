export class UpdateDiaryEntryDto {
  title?: string;
  roughNotes?: string;
  content?: string;
  mood?: string;
  hoursWorked?: number;
  attachments?: string[];
  skills?: string[];
  isDraft?: boolean;
  entryDate?: string; // ISO date string
  supervisorComments?: string;
}
