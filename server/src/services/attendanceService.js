// LIFE OS Attendance Intelligence Service

/**
 * Calculate attendance statistics and margin intelligence
 * @param {number} attended - Number of attended classes
 * @param {number} total - Total number of classes held
 * @param {number} target - Target attendance percentage (e.g. 75)
 */
export function calculateAttendanceStats(attended, total, target = 75) {
  const currentAttended = Math.max(0, Number(attended) || 0);
  const currentTotal = Math.max(0, Number(total) || 0);
  const targetPct = Math.min(100, Math.max(1, Number(target) || 75));

  if (currentTotal === 0) {
    return {
      attended: 0,
      total: 0,
      percentage: 100,
      targetPercentage: targetPct,
      classesToReachTarget: 0,
      safeClassesToMiss: 0,
      isShortage: false,
      statusLabel: 'No classes held yet',
    };
  }

  const percentage = Math.round(((currentAttended / currentTotal) * 100) * 10) / 10;
  const isShortage = percentage < targetPct;

  let classesToReachTarget = 0;
  let safeClassesToMiss = 0;

  if (isShortage) {
    // Formula: (target * total - 100 * attended) / (100 - target)
    if (targetPct < 100) {
      const numerator = (targetPct * currentTotal) - (100 * currentAttended);
      const denominator = 100 - targetPct;
      classesToReachTarget = Math.max(0, Math.ceil(numerator / denominator));
    } else {
      classesToReachTarget = 999; // Impossible to reach 100% if missed any
    }
  } else {
    // Formula: (100 * attended - target * total) / target
    const numerator = (100 * currentAttended) - (targetPct * currentTotal);
    safeClassesToMiss = Math.max(0, Math.floor(numerator / targetPct));
  }

  let statusLabel = 'On Track';
  if (percentage < 65) {
    statusLabel = 'Critical Shortage';
  } else if (percentage < targetPct) {
    statusLabel = 'Warning: Below Target';
  } else if (safeClassesToMiss >= 3) {
    statusLabel = 'Safe Margin';
  }

  return {
    attended: currentAttended,
    total: currentTotal,
    percentage,
    targetPercentage: targetPct,
    classesToReachTarget,
    safeClassesToMiss,
    isShortage,
    statusLabel,
  };
}
