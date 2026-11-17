import { describe, it, expect } from 'vitest';
import { calculateAttendanceStats } from '../src/services/attendanceService.js';

describe('Attendance Intelligence Service', () => {
  it('should correctly handle zero total classes with 100% default', () => {
    const stats = calculateAttendanceStats(0, 0, 75);
    expect(stats.percentage).toBe(100);
    expect(stats.isShortage).toBe(false);
    expect(stats.classesToReachTarget).toBe(0);
  });

  it('should calculate accurate percentage and safe classes to miss when above target', () => {
    // 40 attended out of 45 total (88.88%), target = 75%
    // Safe miss formula: floor((100 * 40 - 75 * 45) / 75) = floor((4000 - 3375) / 75) = floor(625 / 75) = 8 classes
    const stats = calculateAttendanceStats(40, 45, 75);
    expect(stats.percentage).toBe(88.9);
    expect(stats.isShortage).toBe(false);
    expect(stats.safeClassesToMiss).toBe(8);
    expect(stats.classesToReachTarget).toBe(0);
  });

  it('should calculate accurate consecutive classes needed when below target', () => {
    // 20 attended out of 30 total (66.66%), target = 75%
    // Needed formula: ceil((75 * 30 - 100 * 20) / (100 - 75)) = ceil((2250 - 2000) / 25) = ceil(250 / 25) = 10 classes
    const stats = calculateAttendanceStats(20, 30, 75);
    expect(stats.percentage).toBe(66.7);
    expect(stats.isShortage).toBe(true);
    expect(stats.classesToReachTarget).toBe(10);
    expect(stats.safeClassesToMiss).toBe(0);
    expect(stats.statusLabel).toContain('Warning');
  });

  it('should flag critical shortage when attendance drops below 65%', () => {
    const stats = calculateAttendanceStats(15, 30, 75); // 50%
    expect(stats.percentage).toBe(50);
    expect(stats.statusLabel).toBe('Critical Shortage');
  });
});
