/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test, type Page } from '@playwright/test';
import { mockFirestore } from '../support/firestore-mock';
import { mockImages } from '../support/images';
import { gotoSkin, useSkin } from '../support/skin';

test.beforeEach(async ({ page }) => {
  await useSkin(page, 'academic');
  await mockFirestore(page);
  await mockImages(page);
});

test.describe('a breath of wind lifts a photo or a note from behind', () => {
  test('a photo taped to the board swings its lower edge towards you under the pointer, and settles back', async ({
    page,
  }) => {
    await gotoSkin(page, '/projects');
    const photo = page.locator('figure.ac-wind').first();
    await photo.scrollIntoViewIfNeeded();
    await expect(photo).toHaveCSS('transform', 'none');
    await photo.hover();
    // a 3D turn about its top edge, where the tape holds it
    await expect(photo).toHaveCSS('transform', /^matrix3d\(/);
    await expect(photo).toHaveCSS('transform-origin', /^[\d.]+px 0px/);
    await page.mouse.move(2, 2);
    await expect(photo).toHaveCSS('transform', 'none');
  });

  test('it does nothing for reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await gotoSkin(page, '/projects');
    const photo = page.locator('figure.ac-wind').first();
    await photo.scrollIntoViewIfNeeded();
    await photo.hover();
    await expect(photo).toHaveCSS('transform', 'none');
  });

  test('the sheet with the contact form is lifted like the others, and the form still works under the pointer', async ({
    page,
  }) => {
    await gotoSkin(page, '/services');
    const sheet = page.locator('[data-slot="ac-paper"]:has(form)');
    await expect(sheet).toHaveClass(/ac-wind/);
    const send = page.getByRole('button', { name: 'Send' });
    await send.scrollIntoViewIfNeeded();
    await send.hover();
    await expect(sheet).toHaveCSS('transform', /^matrix3d\(/);
    const name = page.getByLabel('Name');
    await name.fill('Ada');
    await expect(name).toHaveValue('Ada');
  });

  for (const path of [
    '/',
    '/about',
    '/resume',
    '/projects',
    '/certificates',
    '/services',
    '/payment',
  ]) {
    test(`${path}: every sheet, note and photo of the board is lifted the same way`, async ({
      page,
    }) => {
      await gotoSkin(page, path);
      await page.waitForTimeout(1500);
      const still = await page.evaluate(() => {
        const paper =
          '.ac-tape, .ac-sticky, [data-slot="ac-paper"], [class*="bg-ac-polaroid"]';
        return [...document.querySelectorAll(paper)]
          .filter((el) => {
            const box = el.getBoundingClientRect();
            return (
              box.width > 0 &&
              // a window, a menu and the toast are not pinned to the board; a photo inside one that is lifted moves with it
              !el.closest(
                '[role="dialog"], [role="menu"], .pointer-events-none',
              ) &&
              !el.closest('.ac-wind') &&
              !el.classList.contains('ac-wind')
            );
          })
          .map((el) => (el.getAttribute('class') ?? '').slice(0, 60));
      });
      expect(still).toEqual([]);
    });
  }

  test.describe('the screens that are not a page', () => {
    const lifted = (page: Page) =>
      page.locator('[data-slot="ac-paper"]').first();

    test('the 404, Coming soon and the maintenance note are lifted like the other sheets', async ({
      page,
    }) => {
      await gotoSkin(page, '/no-such-page');
      await expect(lifted(page)).toHaveClass(/ac-wind/);
      await expect(
        page.getByRole('heading', { level: 1, name: /doesn't exist/i }),
      ).toBeVisible();

      await mockFirestore(page, { 'site/live': { pages: { resume: 'soon' } } });
      await gotoSkin(page, '/resume');
      await expect(
        page.getByRole('heading', { level: 1, name: /coming soon/i }),
      ).toBeVisible();
      await expect(lifted(page)).toHaveClass(/ac-wind/);

      await page.unroute('**/firestore.googleapis.com/**');
      await mockFirestore(page, {
        'site/live': {
          maintenance: { enabled: true, message: 'Back soon', l10n: {} },
        },
      });
      await gotoSkin(page, '/');
      await expect(page.getByText('Back soon', { exact: true })).toBeVisible();
      await expect(lifted(page)).toHaveClass(/ac-wind/);
    });
  });
});
