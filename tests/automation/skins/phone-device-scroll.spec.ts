/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test } from '@playwright/test';
import { mockFirestore } from '../support/firestore-mock';
import { mockImages } from '../support/images';
import { gotoSkin, useSkin } from '../support/skin';

// The window around the device never scrolls: a focus or a scrollIntoView inside the screen may move the page of the app, but never the
// device itself (an `overflow: hidden` box can be scrolled that way, which pushed the device and the Fold button up out of the window).

test.beforeEach(async ({ page }) => {
  await useSkin(page, 'phone');
  await mockFirestore(page);
  await mockImages(page);
});

for (const size of [
  { width: 1440, height: 900 },
  { width: 1280, height: 720 },
]) {
  test(`the device stays where it is while the page is focused and scrolled into view (${size.width}x${size.height})`, async ({
    page,
  }) => {
    await page.setViewportSize(size);
    await gotoSkin(page, '/projects');
    const fold = page.getByRole('button', { name: 'Fold', exact: true });
    await expect(fold).toBeVisible();
    const before = await fold.boundingBox();

    for (let i = 0; i < 25; i++) await page.keyboard.press('Tab');
    // what a browser does for a focus, an anchor or a `scrollIntoView` call: every element of the device is asked to come into view
    await page.evaluate(() => {
      for (const element of document.querySelectorAll(
        '[data-ph-screen] a, [data-ph-screen] button',
      ))
        element.scrollIntoView({ block: 'end', inline: 'end' });
      document.querySelector('[data-ph-screen] a')?.scrollIntoView();
    });

    const moved = await page.evaluate(() => {
      const backdrop = document.querySelector('.ph-backdrop');
      return {
        backdropTop: backdrop?.scrollTop ?? -1,
        backdropLeft: backdrop?.scrollLeft ?? -1,
        windowY: window.scrollY,
        windowX: window.scrollX,
      };
    });
    expect(moved).toEqual({
      backdropTop: 0,
      backdropLeft: 0,
      windowY: 0,
      windowX: 0,
    });
    const after = await fold.boundingBox();
    expect(after?.y).toBeCloseTo(before?.y ?? 0, 0);
    expect(after?.y ?? -1).toBeGreaterThanOrEqual(0);
  });
}
