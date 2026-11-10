/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test } from '@playwright/test';
import { SKIN_IDS } from '@/lib/skin/skins';
import { mockFirestore } from '../support/firestore-mock';
import { mockImages } from '../support/images';
import { gotoSkin, useSkin } from '../support/skin';

/**
 * What every skin owes a visitor who uses the keyboard, said once for all of them: while a dialog is open Tab and Shift+Tab go round
 * inside it. Base UI lets focus leave through its guards (to reach the browser's own bar), which put it on the page behind for a moment:
 * the logo link, a menu. A skin added to `SKIN_IDS` is checked here without anyone adding a line.
 */
for (const skin of SKIN_IDS) {
  test.describe(`a dialog of the ${skin} skin`, () => {
    test.beforeEach(async ({ page }) => {
      await useSkin(page, skin);
      await mockFirestore(page);
      await mockImages(page);
      if (skin === 'standard') await page.goto('/projects');
      else await gotoSkin(page, '/projects');
      await page
        .getByRole('button', { name: /screenshots/ })
        .first()
        .click();
      await expect(page.getByRole('dialog').first()).toBeVisible();
    });

    const outside = (page: import('@playwright/test').Page) =>
      page.evaluate(() => {
        const dialog = document.querySelector('[role="dialog"]');
        return !dialog?.contains(document.activeElement);
      });

    test('keeps Tab inside, going from the last control to the first', async ({
      page,
    }) => {
      for (let i = 0; i < 60; i += 1) {
        await page.keyboard.press('Tab');
        expect(await outside(page), `after Tab ${i + 1}`).toBe(false);
      }
    });

    test('keeps Shift+Tab inside, going from the first control to the last', async ({
      page,
    }) => {
      for (let i = 0; i < 60; i += 1) {
        await page.keyboard.press('Shift+Tab');
        expect(await outside(page), `after Shift+Tab ${i + 1}`).toBe(false);
      }
    });

    test('still closes with Escape and gives the focus back to the button that opened it', async ({
      page,
    }) => {
      // not after a Tab: on a button with a tooltip the first Escape dismisses the tooltip (WCAG 1.4.13), the second the dialog
      await page.keyboard.press('Escape');
      await expect(page.getByRole('dialog')).toBeHidden();
      await expect(
        page.getByRole('button', { name: /screenshots/ }).first(),
      ).toBeFocused();
    });
  });
}
