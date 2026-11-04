/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test } from '@playwright/test';
import { mockFirestore } from './support/firestore-mock';

test.beforeEach(async ({ page }) => {
  await mockFirestore(page);
});

test('About shows the profile, the specialties and the photos', async ({
  page,
}) => {
  await page.goto('/about');

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('About');
  await expect(
    page.getByText('My background is the Master of Science'),
  ).toBeVisible();
  for (const name of ['Software Engineer', 'Mobile Developer', 'Web Developer'])
    await expect(page.getByText(name, { exact: true })).toBeVisible();
  await expect(page.getByRole('img', { name: /Portrait of/ })).toBeVisible();
  await expect(page.getByRole('img', { name: /Photo of/ })).toHaveCount(2);
});

test('the core stack lists the highlighted skills in rank order with where they were used', async ({
  page,
}) => {
  await page.goto('/about');
  const cards = page.getByRole('article');
  await expect(cards).toHaveCount(5);
  await expect(cards.nth(0)).toContainText('Kotlin');
  await expect(cards.nth(0)).toContainText('Used at FPT · MoMo');
  await expect(cards.nth(1)).toContainText('KMM');
  await expect(cards.nth(3)).toContainText('Used at FPT · Side projects');
  await expect(cards.nth(4)).toContainText('Claude Code');
  await expect(
    page.getByRole('link', { name: 'See all skills' }),
  ).toHaveAttribute('href', '/resume#skills');
});

test('there is no horizontal scroll on a phone', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/about');
  await expect(page.getByRole('heading', { name: 'Core stack' })).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test.describe('in Vietnamese', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
  });

  test('About is translated', async ({ page }) => {
    await page.goto('/about');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Giới thiệu',
    );
    await expect(
      page.getByRole('heading', { name: 'Công nghệ chính' }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Xem tất cả kỹ năng' }),
    ).toBeVisible();
    await expect(page.getByRole('article').nth(3)).toContainText(
      'Đã dùng tại FPT · Dự án cá nhân',
    );
  });
});
