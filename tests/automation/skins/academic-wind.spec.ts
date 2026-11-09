/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test } from '@playwright/test';
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

  test('a sheet with controls in it is not moved under the pointer', async ({
    page,
  }) => {
    await gotoSkin(page, '/services');
    const form = page.getByRole('button', { name: 'Send' });
    await form.scrollIntoViewIfNeeded();
    await form.hover();
    await expect(page.locator('[data-slot="ac-paper"]:has(form)')).toHaveCSS(
      'transform',
      'none',
    );
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
    test(`${path}: every photo and note with no control in it is lifted the same way`, async ({
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
              // a sheet with a field or a button in it would move under the pointer
              !el.querySelector('button, a[href], input, textarea, select') &&
              !el.matches('button, a') &&
              !el.classList.contains('ac-wind')
            );
          })
          .map((el) => (el.getAttribute('class') ?? '').slice(0, 60));
      });
      expect(still).toEqual([]);
    });
  }
});
