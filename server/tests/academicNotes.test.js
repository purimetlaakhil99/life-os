import { describe, it, expect } from 'vitest';
import { generateStructuredNotes } from '../src/services/notesGeneratorService.js';

describe('12-Section Academic Notes Service', () => {
  it('should generate complete 12-section structured notes for any curriculum concept', async () => {
    const notes = await generateStructuredNotes({
      subject: 'Operating Systems',
      topic: 'Process Scheduling Algorithms',
      unit: 'Unit 2',
      style: 'exam_oriented',
    });

    expect(notes.subject).toBe('Operating Systems');
    expect(notes.topic).toBe('Process Scheduling Algorithms');

    const s = notes.sections;
    expect(s.introduction).toBeDefined();
    expect(Array.isArray(s.definitions)).toBe(true);
    expect(s.detailedExplanations).toBeDefined();
    expect(Array.isArray(s.importantConcepts)).toBe(true);
    expect(Array.isArray(s.examples)).toBe(true);
    expect(s.diagramsDescription).toBeDefined();
    expect(s.comparisonsTables).toBeDefined();
    expect(s.advantagesDisadvantages).toBeDefined();
    expect(Array.isArray(s.applications)).toBe(true);
    expect(Array.isArray(s.examImportantPoints)).toBe(true);
    expect(s.shortRevisionNotes).toBeDefined();
    expect(s.longAnswerExamPrep).toContain('16-Mark Question Blueprint');
  });
});
