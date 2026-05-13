import { Injectable } from '@nestjs/common';

@Injectable()
export class AiService {
  /**
   * Helper to call OpenAI API using standard fetch
   */
  private async callOpenAi(prompt: string): Promise<string | null> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey.includes('your-openai-key')) return null;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are an AI assistant designed to help interns write professional diary entries and reports.',
            },
            {
              role: 'user',
              content: prompt,
            }
          ],
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        console.error('OpenAI API Error:', await response.text());
        return null;
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content?.trim() || null;
    } catch (e) {
      console.error('Failed to call OpenAI', e);
      return null;
    }
  }

  /**
   * Helper to call Gemini API using standard fetch (Free tier!)
   */
  private async callGemini(prompt: string): Promise<string | null> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
          }),
        },
      );

      if (!response.ok) {
        console.error('Gemini API Error:', await response.text());
        return null;
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
    } catch (e) {
      console.error('Failed to call Gemini', e);
      return null;
    }
  }

  /**
   * Polish rough notes into a professional diary entry based on domain detection
   */
  async polishDiaryEntry(roughNotes: string, role?: string, company?: string): Promise<string> {
    const cleanNotes = roughNotes.trim();
    if (!cleanNotes) return '';

    const prompt = `Convert the following rough notes written by an intern into a polished, professional, report-ready daily diary log. 
The tone should be professional and outcome-focused.
The intern's role is: "${role || 'Intern'}" ${company ? `at company: "${company}"` : ''}.
Write the response in appropriate professional jargon suitable for this role/industry.
Keep it concise (2-4 sentences max). Do not include any intros or outros, just output the polished paragraph itself.

Rough notes: "${cleanNotes}"`;

    // 1. Try Gemini
    const geminiResult = await this.callGemini(prompt);
    if (geminiResult) return geminiResult;

    // 2. Try OpenAI
    const openAiResult = await this.callOpenAi(prompt);
    if (openAiResult) return openAiResult;

    // 3. Fallback Heuristic AI
    return this.heuristicPolish(cleanNotes, role, company);
  }

  /**
   * Detect professional skills based on rough notes or final text
   */
  async detectSkills(text: string, role?: string): Promise<string[]> {
    const cleanText = text.trim();
    if (!cleanText) return [];

    const prompt = `Analyze the following intern work description for the role of "${role || 'Intern'}" and extract a list of 2-4 professional skills or technologies used (e.g. "React", "Network Security", "Clinical Documentation", "Vulnerability Scanning", "Lesson Planning", "Data Analysis", "Marketing Strategy", "Mechanical Design").
Return ONLY the skills as a comma-separated list, with no other text, bullets, or numbers.

Intern description: "${cleanText}"`;

    // 1. Try Gemini
    const geminiResult = await this.callGemini(prompt);
    if (geminiResult) {
      return geminiResult.split(',').map(s => s.trim()).filter(Boolean);
    }

    // 2. Try OpenAI
    const openAiResult = await this.callOpenAi(prompt);
    if (openAiResult) {
      return openAiResult.split(',').map(s => s.trim()).filter(Boolean);
    }

    // 3. Fallback Heuristic Skill Detector
    return this.heuristicDetectSkills(cleanText, role);
  }

  /**
   * Generate reports
   */
  async generateReport(entries: any[]): Promise<string> {
    const summaryText = entries.map(e => `- ${e.content || e.roughNotes}`).join('\n');
    const prompt = `Synthesize the following list of daily intern logs into a comprehensive, professional progress report summary (1-2 paragraphs). Outline key accomplishments, skills demonstrated, and progress made: \n\n${summaryText}`;

    const geminiResult = await this.callGemini(prompt);
    if (geminiResult) return geminiResult;

    const openAiResult = await this.callOpenAi(prompt);
    if (openAiResult) return openAiResult;

    return `This is a synthesized summary of ${entries.length} internship logs. The intern demonstrated consistent competency across tasks, successfully translating daily responsibilities into professional outcomes. Key highlights include active problem-solving, project contribution, and seamless adaptation to the team environment.`;
  }

  // ─── HEURISTIC FALLBACKS (NO-CONFIG ADVANCED EXPERIENCE) ───────────────────

  private heuristicPolish(notes: string, role?: string, company?: string): string {
    const clean = notes.trim().replace(/[.;,]+$/, '');
    const lower = clean.toLowerCase();
    const roleLower = (role || '').toLowerCase();
    const displayRole = role || 'Intern';
    const displayCompany = company ? ` at ${company}` : '';

    // 1. Procedural Verb-Translation Engine
    let action = clean;
    const replacements = [
      { regex: /^(did|done)\s+/i, rep: 'Completed ' },
      { regex: /^(fixed|resolved|handled|patched)\s+/i, rep: 'Successfully resolved ' },
      { regex: /^(updated|changed|modified|edited)\s+/i, rep: 'Optimized and updated ' },
      { regex: /^(checked|watched|saw|see|logged|monitored|analyzed)\s+/i, rep: 'Conducted systematic monitoring and analysis of ' },
      { regex: /^(created|built|made|developed|wrote|coded)\s+/i, rep: 'Designed and implemented ' },
      { regex: /^(tested|ran|debugged)\s+/i, rep: 'Conducted rigorous testing and quality assurance on ' },
      { regex: /^(attended|had|participated in)\s+/i, rep: 'Participated in collaborative team sessions regarding ' }
    ];

    let matched = false;
    for (const r of replacements) {
      if (r.regex.test(lower)) {
        action = clean.replace(r.regex, r.rep);
        matched = true;
        break;
      }
    }

    if (!matched) {
      action = `Assisted with the task to ${clean.charAt(0).toLowerCase() + clean.slice(1)}`;
    }

    // 2. Classify Industry & Interpolate Custom Grammar
    // Cybersecurity & SOC Analyst
    if (
      lower.includes('security') || lower.includes('cyber') || lower.includes('penetration') ||
      lower.includes('exploit') || lower.includes('hack') || lower.includes('firewall') ||
      lower.includes('vulnerability') || lower.includes('auth') || lower.includes('network') ||
      lower.includes('siem') || lower.includes('log') || lower.includes('alert') ||
      lower.includes('monitor') || lower.includes('soc') ||
      roleLower.includes('security') || roleLower.includes('cyber') || roleLower.includes('soc') || roleLower.includes('analyst')
    ) {
      return `As a ${displayRole}${displayCompany}, I ${action.charAt(0).toLowerCase() + action.slice(1)}. This work supported active threat detection protocols and maintained high integrity across network operations.`;
    }

    // Medical / Healthcare
    if (
      lower.includes('patient') || lower.includes('clinical') || lower.includes('doctor') ||
      lower.includes('medicine') || lower.includes('drug') || lower.includes('hospital') ||
      lower.includes('health') || lower.includes('ward') || lower.includes('nurse') ||
      lower.includes('diagnose') || lower.includes('prescription') ||
      roleLower.includes('medical') || roleLower.includes('clinical') || roleLower.includes('doctor') || roleLower.includes('nurse') || roleLower.includes('dentist')
    ) {
      return `In my capacity as a ${displayRole}${displayCompany}, I ${action.charAt(0).toLowerCase() + action.slice(1)}, ensuring strict compliance with operational healthcare standards and care protocols.`;
    }

    // Education
    if (
      lower.includes('school') || lower.includes('class') || lower.includes('student') ||
      lower.includes('teach') || lower.includes('lesson') || lower.includes('lecture') ||
      lower.includes('course') || lower.includes('curriculum') || lower.includes('classroom') ||
      roleLower.includes('teach') || roleLower.includes('educat') || roleLower.includes('school') || roleLower.includes('tutor')
    ) {
      return `Working as a ${displayRole}${displayCompany}, I ${action.charAt(0).toLowerCase() + action.slice(1)} to foster structured learning and improve classroom engagement metrics.`;
    }

    // Software Engineering
    if (
      lower.includes('bug') || lower.includes('code') || lower.includes('react') ||
      lower.includes('next') || lower.includes('api') || lower.includes('database') ||
      lower.includes('backend') || lower.includes('frontend') || lower.includes('git') ||
      lower.includes('dev') ||
      roleLower.includes('software') || roleLower.includes('developer') || roleLower.includes('engineer') || roleLower.includes('programmer')
    ) {
      return `During my daily shift as a ${displayRole}${displayCompany}, I ${action.charAt(0).toLowerCase() + action.slice(1)}. This contributed to overall code quality and enhanced backend/frontend alignment.`;
    }

    // Generic industry template
    return `As a ${displayRole}${displayCompany}, I ${action.charAt(0).toLowerCase() + action.slice(1)}. This helped optimize daily operational workflows and supported team performance goals.`;
  }

  private heuristicDetectSkills(text: string, role?: string): string[] {
    const lower = text.toLowerCase();
    const roleLower = (role || '').toLowerCase();
    const skillsSet = new Set<string>();

    // Cybersecurity
    if (lower.includes('exploit') || lower.includes('hack') || lower.includes('penetration')) skillsSet.add('Penetration Testing');
    if (lower.includes('security') || lower.includes('firewall') || roleLower.includes('security') || lower.includes('siem') || lower.includes('log') || roleLower.includes('analyst') || roleLower.includes('soc')) skillsSet.add('Security Operations (SOC)');
    if (lower.includes('vulnerability')) skillsSet.add('Vulnerability Assessment');
    if (lower.includes('auth') || lower.includes('password') || lower.includes('login')) skillsSet.add('Access Control');

    // Medical
    if (lower.includes('patient') || lower.includes('clinical') || roleLower.includes('clinical') || roleLower.includes('patient')) skillsSet.add('Patient Care');
    if (lower.includes('hospital') || lower.includes('documentation') || lower.includes('record')) skillsSet.add('Clinical Documentation');
    if (lower.includes('diagnose') || lower.includes('medicine') || lower.includes('drug') || roleLower.includes('doctor') || roleLower.includes('dentist')) skillsSet.add('Healthcare Operations');

    // Education
    if (lower.includes('student') || lower.includes('teach') || lower.includes('class') || roleLower.includes('teach') || roleLower.includes('tutor')) skillsSet.add('Classroom Management');
    if (lower.includes('lesson') || lower.includes('curriculum')) skillsSet.add('Lesson Planning');
    if (lower.includes('lecture') || lower.includes('course')) skillsSet.add('Educational Pedagogy');

    // Software Engineering
    if (lower.includes('react') || lower.includes('next')) skillsSet.add('Frontend Development');
    if (lower.includes('node') || lower.includes('backend') || lower.includes('express')) skillsSet.add('Backend Development');
    if (lower.includes('database') || lower.includes('postgres') || lower.includes('sql') || lower.includes('prisma')) skillsSet.add('Database Systems');
    if (lower.includes('bug') || lower.includes('fix') || lower.includes('debugging')) skillsSet.add('Debugging');

    // Any generic industry skill generation if none matched
    if (skillsSet.size === 0) {
      if (role) {
        // Generate role-specific tags
        const capitalizedRole = role.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        skillsSet.add(`${capitalizedRole} Operations`);
      }
      skillsSet.add('Analytical Skills');
      skillsSet.add('Task Management');
    }

    return Array.from(skillsSet);
  }
}
