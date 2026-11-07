/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test, type Page } from '@playwright/test';
import { mockFirestore } from '../support/firestore-mock';
import { mockImages } from '../support/images';
import { gotoSkin, useSkin } from '../support/skin';

const VENUS =
  'https://raw.githubusercontent.com/bachbnt/assets/main/project/venusai';

test.beforeEach(async ({ page }) => {
  await useSkin(page, 'stream');
  await mockFirestore(page);
  await mockImages(page);
});

const featured = (page: Page) =>
  page.getByRole('region', { name: 'Featured projects' });
/** The 16:9 thumbnail of the first featured project (VenusAI). */
const thumb = (page: Page) =>
  featured(page).getByRole('listitem').first().locator('.aspect-video');
const preview = (page: Page) => thumb(page).locator('[data-career-preview]');
const cover = (page: Page) => thumb(page).locator('img').first();

/** The requests for the screenshots of VenusAI (the cover is another file). */
const watchScreenshots = (page: Page) => {
  const seen: string[] = [];
  page.on('request', (request) => {
    if (/\/venusai\/\d+\.webp$/.test(request.url())) seen.push(request.url());
  });
  return seen;
};

test.describe('the hover preview of a featured project', () => {
  test('asks for no screenshot before the first hover', async ({ page }) => {
    const seen = watchScreenshots(page);
    await gotoSkin(page, '/');
    await expect(
      featured(page).getByRole('heading', { name: 'VenusAI' }),
    ).toBeVisible();
    await expect(preview(page)).toHaveCount(0);
    expect(seen).toEqual([]);
  });

  test('a mouse on the thumbnail plays the real screenshots, with a red line, and leaving brings the cover back', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    const coverSrc = await cover(page).getAttribute('src');
    expect(coverSrc).toBe(`${VENUS}/venusai.webp`);
    await thumb(page).hover();
    await expect(preview(page)).toHaveAttribute('src', `${VENUS}/01.webp`);
    // the red line along the bottom stands for the picture that is on
    await expect(thumb(page).locator('.bg-sm-red')).toBeVisible();
    // about one picture a second, in the order of the gallery
    await expect(preview(page)).toHaveAttribute('src', `${VENUS}/02.webp`, {
      timeout: 5000,
    });
    await expect(preview(page)).toHaveAttribute('src', `${VENUS}/03.webp`, {
      timeout: 5000,
    });
    // the same 16:9 box all the time
    const box = await thumb(page).boundingBox();
    expect(box!.width / box!.height).toBeCloseTo(16 / 9, 1);
    await page.mouse.move(0, 0);
    await expect(preview(page)).toHaveCount(0);
    await expect(cover(page)).toHaveAttribute('src', coverSrc!);
  });

  test('the keyboard focus on the project plays it too, and blur stops it', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    await featured(page)
      .getByRole('link', { name: /VenusAI/ })
      .first()
      .focus();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    await expect(
      featured(page)
        .getByRole('link', { name: /VenusAI/ })
        .first(),
    ).toBeFocused();
    await expect(preview(page)).toHaveAttribute('src', `${VENUS}/01.webp`);
    await featured(page)
      .getByRole('link', { name: /VenusAI/ })
      .first()
      .blur();
    await expect(preview(page)).toHaveCount(0);
  });

  test('a finger does nothing', async ({ page }) => {
    const seen = watchScreenshots(page);
    await gotoSkin(page, '/');
    await expect(
      featured(page).getByRole('heading', { name: 'VenusAI' }),
    ).toBeVisible();
    await thumb(page).dispatchEvent('pointerover', {
      pointerType: 'touch',
      bubbles: true,
    });
    await page.waitForTimeout(300);
    await expect(preview(page)).toHaveCount(0);
    expect(seen).toEqual([]);
  });

  test('with reduced motion the cover just stays', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const seen = watchScreenshots(page);
    await gotoSkin(page, '/');
    await thumb(page).hover();
    await page.waitForTimeout(1500);
    await expect(preview(page)).toHaveCount(0);
    expect(seen).toEqual([]);
  });

  test('a project with no screenshots does nothing', async ({ page }) => {
    await page.unrouteAll({ behavior: 'ignoreErrors' });
    await mockFirestore(page, {}, (collection, id, doc) =>
      collection === 'projects' && id === 'venus-ai'
        ? { ...doc, images: [] }
        : doc,
    );
    await mockImages(page);
    await gotoSkin(page, '/');
    await expect(
      featured(page).getByRole('heading', { name: 'VenusAI' }),
    ).toBeVisible();
    await thumb(page).hover();
    await page.waitForTimeout(1500);
    await expect(preview(page)).toHaveCount(0);
  });
});
