import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:5000';

test.describe('LIFE OS End-to-End Browser Verification', () => {
  test('signs in via 1-click demo login and navigates all 8 primary sections', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page.getByText('LIFE OS')).toBeVisible();

    await page.getByRole('button', { name: /1-Click Instant Demo Sign-In/i }).click();
    await expect(page.getByText('AI Daily Briefing')).toBeVisible({ timeout: 10000 });

    const sections = [
      { nav: 'AI Assistant', heading: /Unified AI Brain/i },
      { nav: 'My Day', heading: /My Day & Tasks/i },
      { nav: 'Planner', heading: /Smart Planner & Schedule/i },
      { nav: 'Student Life', heading: /Attendance Intelligence/i },
      { nav: 'My Memory', heading: /Private Isolated Memory Store/i },
      { nav: 'Goals', heading: /Goals, Habits & Routines/i },
      { nav: 'Settings', heading: /Automatic Birthday Email System/i },
      { nav: 'Home', heading: /AI Daily Briefing/i },
    ];

    for (const section of sections) {
      await page.getByRole('button', { name: section.nav, exact: false }).first().click();
      await expect(page.getByText(section.heading).first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('executes AI chat intent and generates 12-section academic notes', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.getByRole('button', { name: /1-Click Instant Demo Sign-In/i }).click();
    await expect(page.getByText('AI Daily Briefing')).toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: /AI Assistant/i }).first().click();
    const input = page.locator('input[placeholder*="Type or speak"]');
    await input.fill('Check my attendance margin');
    await input.press('Enter');
    await expect(page.getByText(/attendance summary/i)).toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: /Student Life/i }).first().click();
    await page.getByRole('button', { name: /12-Section AI Notes/i }).click();
    await page.getByRole('button', { name: /Generate AI Notes/i }).click();
    await expect(page.getByText(/Download Clean PDF/i)).toBeVisible({ timeout: 10000 });
  });
});
