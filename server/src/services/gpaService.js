// LIFE OS Academic Performance & GPA Calculation Service

const DEFAULT_GRADE_MAP = {
  'O': 10,
  'A+': 9,
  'A': 8,
  'B+': 7,
  'B': 6,
  'C': 5,
  'P': 4,
  'F': 0,
};

/**
 * Calculate SGPA (Semester Grade Point Average)
 * Formula: Sum(Credits * GradePoints) / Sum(Credits)
 * @param {Array<{subject: string, credits: number, grade: string, gradePoint?: number}>} subjects
 * @param {Object} customGradeMap
 */
export function calculateSGPA(subjects = [], customGradeMap = DEFAULT_GRADE_MAP) {
  if (!Array.isArray(subjects) || subjects.length === 0) {
    return { sgpa: 0, totalCredits: 0, earnedPoints: 0 };
  }

  let totalCredits = 0;
  let weightedPoints = 0;

  for (const sub of subjects) {
    const credits = Number(sub.credits) || 0;
    if (credits <= 0) continue;

    let points = typeof sub.gradePoint === 'number' ? sub.gradePoint : undefined;
    if (points === undefined && sub.grade) {
      const normalizedGrade = String(sub.grade).trim().toUpperCase();
      points = customGradeMap[normalizedGrade] !== undefined ? customGradeMap[normalizedGrade] : 0;
    }

    if (points === undefined) points = 0;

    totalCredits += credits;
    weightedPoints += credits * points;
  }

  const sgpa = totalCredits > 0 ? Math.round((weightedPoints / totalCredits) * 100) / 100 : 0;

  return {
    sgpa,
    totalCredits,
    earnedPoints: Math.round(weightedPoints * 100) / 100,
  };
}

/**
 * Calculate Cumulative GPA (CGPA) across multiple semesters
 * Formula: Sum(Semester_SGPA * Semester_Credits) / Sum(Semester_Credits)
 * @param {Array<{semester: number, sgpa: number, credits: number}>} semesters
 */
export function calculateCGPA(semesters = []) {
  if (!Array.isArray(semesters) || semesters.length === 0) {
    return { cgpa: 0, totalCredits: 0 };
  }

  let totalCredits = 0;
  let totalWeightedSGPA = 0;

  for (const sem of semesters) {
    const credits = Number(sem.credits) || 0;
    const sgpa = Number(sem.sgpa) || 0;
    if (credits <= 0) continue;

    totalCredits += credits;
    totalWeightedSGPA += credits * sgpa;
  }

  const cgpa = totalCredits > 0 ? Math.round((totalWeightedSGPA / totalCredits) * 100) / 100 : 0;

  return {
    cgpa,
    totalCredits,
  };
}

/**
 * Simulate what-if scenario for upcoming semester or target CGPA
 * @param {number} currentCGPA
 * @param {number} completedCredits
 * @param {number} upcomingCredits
 * @param {number} targetCGPA
 */
export function calculateWhatIfTarget(currentCGPA, completedCredits, upcomingCredits, targetCGPA) {
  const currentTotal = completedCredits * currentCGPA;
  const newTotalCredits = completedCredits + upcomingCredits;
  const requiredTotalPoints = targetCGPA * newTotalCredits;
  const neededPointsInUpcoming = requiredTotalPoints - currentTotal;
  const requiredSGPA = upcomingCredits > 0 ? Math.round((neededPointsInUpcoming / upcomingCredits) * 100) / 100 : 0;

  return {
    possible: requiredSGPA <= 10.0,
    requiredSGPA,
    currentCGPA,
    targetCGPA,
    advice: requiredSGPA <= 10.0
      ? `You need an SGPA of ${requiredSGPA} across ${upcomingCredits} upcoming credits to reach your target CGPA of ${targetCGPA}.`
      : `Reaching ${targetCGPA} in the next semester alone is mathematically unfeasible (requires SGPA > 10.0). Consider spreading your goal over multiple semesters.`,
  };
}
