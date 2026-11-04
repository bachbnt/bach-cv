/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test, type Page } from '@playwright/test';
import { mockFirestore } from './support/firestore-mock';

test.beforeEach(async ({ page }) => {
  await mockFirestore(page);
});

const openCv = async (page: Page) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Download CV' }).first().click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole('region', { name: 'CV preview' }),
  ).toBeVisible();
  await expect(dialog.getByRole('heading', { level: 1 })).toBeVisible();
  return dialog;
};

test('the Download CV button opens the CV as sheets', async ({ page }) => {
  const dialog = await openCv(page);

  await expect(
    dialog.getByRole('heading', { name: 'Bùi Ngô Tôn Bách CV' }),
  ).toBeVisible();
  await expect(
    dialog.getByRole('heading', { level: 1, name: 'Bùi Ngô Tôn Bách' }),
  ).toBeVisible();
  await expect(dialog.getByText('bachbnt@gmail.com')).toBeVisible();
  for (const section of [
    'Summary',
    'Work experience',
    'Education',
    'Certifications',
    'Skills',
    'Projects & research',
  ]) {
    await expect(
      dialog.getByRole('heading', { level: 2, name: section }),
    ).toHaveCount(1);
  }
  expect(
    await dialog.locator('section[aria-label^="Page"]').count(),
  ).toBeGreaterThan(1);
});

test('the CV lists visible entries newest first and honours the cv mode', async ({
  page,
}) => {
  const dialog = await openCv(page);
  const text = await dialog
    .getByRole('region', { name: 'CV preview' })
    .innerText();

  expect(text.indexOf('FPT Software')).toBeGreaterThan(-1);
  expect(text.indexOf('FPT Software')).toBeLessThan(text.indexOf('MoMo'));
  expect(text.indexOf('MoMo')).toBeLessThan(text.indexOf('Devblock Vietnam'));
  // visible but `cv: off`
  expect(text).not.toContain('American Code Lab');
  // hidden documents are never readable by the browser
  expect(text).not.toContain('TMA Solutions');
  expect(text).toContain('Claude Certified Architect - Professional');
  expect(text).toContain('Thesis: Stock Price Trend Prediction');
});

test('Escape closes the CV and returns focus to the button', async ({
  page,
}) => {
  await openCv(page);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: 'Download CV' }).first(),
  ).toBeFocused();
});

test('Download PDF saves a file named from the profile', async ({ page }) => {
  const dialog = await openCv(page);
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 60_000 }),
    dialog.getByRole('button', { name: 'Download PDF' }).click(),
  ]);
  expect(download.suggestedFilename()).toBe('bui-ngo-ton-bach-cv.pdf');
});

test('the button is gone when the CV switch is off', async ({ page }) => {
  await mockFirestore(page, {
    'site/live': { features: { cvDownload: false } },
  });
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: "Where I've worked" }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Download CV' })).toHaveCount(
    0,
  );
});

test('on a phone the CV is a bottom sheet with sheets scaled to fit', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const dialog = await openCv(page);

  const box = await dialog.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.x).toBeCloseTo(0, 0); // the sheet may still be settling by a fraction of a pixel
  expect(box!.width).toBeCloseTo(390, 0);
  expect(box!.y + box!.height).toBeCloseTo(844, 0);

  const sheet = await dialog
    .locator('section[aria-label^="Page"]')
    .first()
    .boundingBox();
  expect(sheet!.width).toBeLessThanOrEqual(390 - 16 + 1);
  expect(sheet!.width).toBeGreaterThan(300);

  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  const close = dialog.getByRole('button', { name: 'Close' });
  expect((await close.boundingBox())!.width).toBeGreaterThanOrEqual(44);
});

test('the CV button in the mobile menu closes the menu and opens the CV', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Open menu' }).click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Download CV' })
    .click();

  const dialog = page.getByRole('dialog');
  await expect(dialog).toHaveCount(1);
  await expect(
    dialog.getByRole('heading', { name: 'Bùi Ngô Tôn Bách CV' }),
  ).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Main' })).toHaveCount(0);
});

test('the CV and the PDF follow the Vietnamese language', async ({ page }) => {
  await page.addInitScript(() =>
    window.localStorage.setItem('bach-cv-lang', 'vi'),
  );
  await page.goto('/');
  await page
    .getByRole('button', { name: 'Tải CV' })
    .or(page.getByRole('button', { name: 'Download CV' }))
    .first()
    .click();
  const dialog = page.getByRole('dialog');
  await expect(
    dialog.getByRole('heading', { level: 2, name: 'Kinh nghiệm làm việc' }),
  ).toBeVisible();
  await expect(
    dialog.getByRole('heading', { level: 2, name: 'Học vấn' }),
  ).toBeVisible();
  await expect(dialog.getByText('Thg 1 2026 – Nay')).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Tải PDF' })).toBeVisible();
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 60_000 }),
    dialog.getByRole('button', { name: 'Tải PDF' }).click(),
  ]);
  expect(download.suggestedFilename()).toBe('bui-ngo-ton-bach-cv.pdf');
});
