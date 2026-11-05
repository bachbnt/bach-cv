/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test, type Page } from '@playwright/test';
import { mockFirestore } from './support/firestore-mock';

test.beforeEach(async ({ page }) => {
  await mockFirestore(page);
});

/** Tabs through the page and returns what had focus without any visible indicator (outline or ring). */
async function withoutFocusRing(page: Page, steps: number) {
  const missing: string[] = [];
  for (let i = 0; i < steps; i++) {
    await page.keyboard.press('Tab');
    const found = await page.evaluate(() => {
      const el = document.activeElement;
      // the Next.js dev overlay is not part of the site
      if (!el || el === document.body || el.tagName.startsWith('NEXTJS'))
        return null;
      const s = getComputedStyle(el);
      const ring =
        (s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0) ||
        (s.boxShadow !== '' && s.boxShadow !== 'none');
      return ring
        ? null
        : `${el.tagName} ${(el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 30)}`;
    });
    if (found) missing.push(found);
  }
  return missing;
}

for (const path of ['/', '/certificates', '/projects', '/services']) {
  test(`every control reached with Tab shows a focus ring on ${path}`, async ({
    page,
  }) => {
    await page.goto(path);
    await page.waitForTimeout(1500);
    expect(await withoutFocusRing(page, 24)).toEqual([]);
  });
}

test('the controls inside a dialog show a focus ring too', async ({ page }) => {
  await page.goto('/certificates');
  await page
    .getByTestId('certificate')
    .first()
    .getByRole('button')
    .first()
    .click();
  await expect(page.getByRole('dialog')).toBeVisible();
  expect(await withoutFocusRing(page, 5)).toEqual([]);
});
