import { describe, it, expect } from 'vitest';
import { generateBirthdayMessage } from '../src/services/aiBrainService.js';

describe('Automatic Birthday System & Multilingual Wishes', () => {
  it('should generate heartfelt wish in English', () => {
    const wish = generateBirthdayMessage({ name: 'Rahul', language: 'en', style: 'heartfelt' });
    expect(wish).toContain('Rahul');
    expect(wish).toContain('blessed birthday');
  });

  it('should generate warm wish in Hindi', () => {
    const wish = generateBirthdayMessage({ name: 'अमित', language: 'hi', style: 'heartfelt' });
    expect(wish).toContain('अमित');
    expect(wish).toContain('जन्मदिन');
    expect(wish).toContain('हार्दिक शुभकामनाएं');
  });

  it('should generate personalized wish in Telugu', () => {
    const wish = generateBirthdayMessage({ name: 'సురేష్', language: 'te', style: 'friendly' });
    expect(wish).toContain('సురేష్');
    expect(wish).toContain('పుట్టినరోజు శుభాకాంక్షలు');
  });

  it('should format humorous wish when style is funny', () => {
    const wishEn = generateBirthdayMessage({ name: 'Karthik', language: 'en', style: 'funny' });
    expect(wishEn).toContain('leveling up');

    const wishHi = generateBirthdayMessage({ name: 'रोहन', language: 'hi', style: 'funny' });
    expect(wishHi).toContain('पार्टी कब दे रहे हो');
  });
});
