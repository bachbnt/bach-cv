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
});
