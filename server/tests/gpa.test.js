import { describe, it, expect } from 'vitest';
import { calculateSGPA, calculateCGPA, calculateWhatIfTarget } from '../src/services/gpaService.js';

describe('Academic Performance & GPA Calculation Service', () => {
  it('should correctly calculate SGPA using credits and letter grades', () => {
    // Subject 1: DBMS (4 credits, Grade O = 10 points) => 40
    // Subject 2: OS (4 credits, Grade A+ = 9 points) => 36
    // Subject 3: Networks (3 credits, Grade A = 8 points) => 24
    // Subject 4: Lab (2 credits, Grade B+ = 7 points) => 14
    // Total Credits = 13, Total Points = 114 => SGPA = 114 / 13 = 8.77
    const subjects = [
      { subject: 'DBMS', credits: 4, grade: 'O' },
      { subject: 'Operating Systems', credits: 4, grade: 'A+' },
      { subject: 'Computer Networks', credits: 3, grade: 'A' },
      { subject: 'OS Lab', credits: 2, grade: 'B+' },
    ];

    const result = calculateSGPA(subjects);
    expect(result.totalCredits).toBe(13);
    expect(result.earnedPoints).toBe(114);
    expect(result.sgpa).toBe(8.77);
  });

  it('should calculate CGPA across multiple semesters correctly', () => {
    // Sem 1: 20 credits, SGPA 8.0 => 160
    // Sem 2: 22 credits, SGPA 8.5 => 187
    // Total Credits = 42, Total = 347 => CGPA = 347 / 42 = 8.26
    const semesters = [
      { semester: 1, credits: 20, sgpa: 8.0 },
      { semester: 2, credits: 22, sgpa: 8.5 },
    ];

    const result = calculateCGPA(semesters);
    expect(result.totalCredits).toBe(42);
    expect(result.cgpa).toBe(8.26);
  });

  it('should accurately compute what-if required SGPA to hit target CGPA', () => {
    // Current: 8.0 CGPA on 60 credits (= 480 points)
    // Target: 8.5 CGPA on 80 total credits (60 + 20 upcoming) => 8.5 * 80 = 680 points
    // Required upcoming points = 680 - 480 = 200 points
    // Required SGPA in upcoming = 200 / 20 = 10.0
    const sim = calculateWhatIfTarget(8.0, 60, 20, 8.5);
    expect(sim.possible).toBe(true);
    expect(sim.requiredSGPA).toBe(10.0);
  });

  it('should flag unfeasible what-if target if required SGPA exceeds 10.0', () => {
    // Target 9.5 when current is 7.0 on 60 credits and only 10 upcoming credits
    const sim = calculateWhatIfTarget(7.0, 60, 10, 9.5);
    expect(sim.possible).toBe(false);
    expect(sim.advice).toContain('mathematically unfeasible');
  });
});
