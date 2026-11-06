/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test } from '@playwright/test';
import { mockFirestore } from './support/firestore-mock';
import { gotoSkin, useSkin } from './support/skin';

test.beforeEach(async ({ page }) => {
  await mockFirestore(page);
});

test.describe('names for assistive technology are in the language of the visitor', () => {
  test('English', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Bach Bui, home' }),
    ).toBeVisible();
  });

  test('Vietnamese', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
    await page.goto('/');
    await expect(page.getByRole('navigation', { name: 'Chính' })).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Bach Bui, trang chủ' }),
    ).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Main' })).toHaveCount(0);
  });

  test('Vietnamese in the Dev skin', async ({ page }) => {
    await useSkin(page, 'dev');
    await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
    await gotoSkin(page, '/');
    await expect(page.getByRole('navigation', { name: 'Chính' })).toBeVisible();
  });
});
