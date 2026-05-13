import { Injectable } from '@nestjs/common';

@Injectable()
export class AiService {
  /**
   * Mocks an OpenAI call to convert rough notes into a professional diary entry.
   * In a real implementation, this would use the official openai npm package.
   */
  async polishDiaryEntry(roughNotes: string): Promise<string> {
    // Mocked AI Response
    return `Today, I successfully completed the following tasks based on the notes: ${roughNotes}. I improved system efficiency and communicated effectively with the team.`;
  }

  /**
   * Mocks an OpenAI call to detect skills from a text snippet.
   */
  async detectSkills(text: string): Promise<string[]> {
    const lowercaseText = text.toLowerCase();
    const detectedSkills: string[] = [];

    if (lowercaseText.includes('react')) detectedSkills.push('React');
    if (lowercaseText.includes('node') || lowercaseText.includes('backend')) detectedSkills.push('Backend Development', 'Node.js');
    if (lowercaseText.includes('bug') || lowercaseText.includes('fix')) detectedSkills.push('Debugging');
    if (lowercaseText.includes('design') || lowercaseText.includes('ui')) detectedSkills.push('UI/UX Design');

    // Return some default skills if none matched
    return detectedSkills.length > 0 ? detectedSkills : ['Communication', 'Problem Solving'];
  }

  /**
   * Mocks report generation based on multiple diary entries.
   */
  async generateReport(entries: any[]): Promise<string> {
    return `This is an AI-generated summary of ${entries.length} entries. The intern showed remarkable growth and contributed significantly to the project deliverables...`;
  }
}
