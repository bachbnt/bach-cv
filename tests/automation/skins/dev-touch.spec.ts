/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test, type Locator, type Page } from '@playwright/test';
import { mockFirestore } from '../support/firestore-mock';
import { mockImages } from '../support/images';
import { gotoSkin, useSkin } from '../support/skin';

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

test.beforeEach(async ({ page }) => {
  await useSkin(page, 'dev');
  await mockFirestore(page);
  await mockImages(page);
});

interface Reach {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/** What a finger can hit on each element: its box together with the invisible `::after` area that some controls have. */
const reaches = (target: Locator): Promise<Reach[]> =>
  target.evaluateAll((elements) =>
    elements
      .filter((el) => el.getBoundingClientRect().width > 0)
      .map((el) => {
        const box = el.getBoundingClientRect();
        const style = getComputedStyle(el);
        const after = getComputedStyle(el, '::after');
        const reach = {
          left: box.left,
          top: box.top,
          right: box.right,
          bottom: box.bottom,
        };
        if (after.content !== 'none' && after.position === 'absolute') {
          // an absolute pseudo-element is placed from the padding edge of its element
          const left = box.left + parseFloat(style.borderLeftWidth);
          const top = box.top + parseFloat(style.borderTopWidth);
          reach.left = Math.min(reach.left, left + parseFloat(after.left));
          reach.top = Math.min(reach.top, top + parseFloat(after.top));
          reach.right = Math.max(
            reach.right,
            left + parseFloat(after.left) + parseFloat(after.width),
          );
          reach.bottom = Math.max(
            reach.bottom,
            top + parseFloat(after.top) + parseFloat(after.height),
          );
        }
        return reach;
      }),
  );

/** Every control is 44 px high; one that holds only an icon is 44 px wide as well (a label gives a chip or a tab its own width). */
const expect44 = async (
  target: Locator,
  minimum = 1,
  { square = false }: { square?: boolean } = {},
) => {
  const all = await reaches(target);
  expect(all.length).toBeGreaterThanOrEqual(minimum);
  for (const r of all) {
    expect(r.bottom - r.top).toBeGreaterThanOrEqual(43.9);
    if (square) expect(r.right - r.left).toBeGreaterThanOrEqual(43.9);
  }
};

const overlap = (a: Reach, b: Reach) =>
  a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

const openPanel = async (page: Page, name: string) => {
  await page
    .locator('div.bg-status')
    .first()
    .getByRole('button', { name, exact: true })
    .click();
  await expect(page.locator('[data-slot="dev-panel"]')).toBeVisible();
};

test.describe('touch targets of the Dev skin are 44 px', () => {
  test('the page is on a coarse pointer', async ({ page }) => {
    await gotoSkin(page, '/');
    expect(
      await page.evaluate(() => matchMedia('(pointer: coarse)').matches),
    ).toBe(true);
  });

  test('the command buttons, plain and small', async ({ page }) => {
    await gotoSkin(page, '/');
    await expect(
      page.getByRole('button', { name: 'Download CV' }).first(),
    ).toBeVisible();
    await expect44(page.locator('main [data-slot="dev-button"]'), 2);
    // the small ones sit on Certificates (the card of a certificate)
    await gotoSkin(page, '/certificates');
    await expect(
      page.locator('main [data-slot="dev-button"]').first(),
    ).toBeVisible();
    await expect44(page.locator('main [data-slot="dev-button"]'), 2);
  });

  test('the filter chips of Projects', async ({ page }) => {
    await gotoSkin(page, '/projects');
    await expect(
      page.locator('[data-slot="dev-filter"]').first(),
    ).toBeVisible();
    await expect44(page.locator('[data-slot="dev-filter"]'), 2);
  });

  test('the skill chips of Resume', async ({ page }) => {
    await gotoSkin(page, '/resume');
    const chips = page
      .locator('#skills')
      .locator('button[data-slot="dev-chip"]');
    await expect(chips.first()).toBeVisible();
    await expect44(chips, 5);
  });

  test('the tabs, Clear and Close of the bottom panel, which do not overlap', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    await openPanel(page, 'Output');
    const head = page.locator('[data-slot="dev-panel"] > div').first();
    await expect44(head.getByRole('button'), 5);
    await expect44(
      head.getByRole('button', { name: /^(Clear output|Close panel)$/ }),
      2,
      { square: true },
    );
    const clear = (
      await reaches(head.getByRole('button', { name: 'Clear output' }))
    )[0];
    const close = (
      await reaches(head.getByRole('button', { name: 'Close panel' }))
    )[0];
    expect(overlap(clear, close)).toBe(false);
    // the tabs do not lie over each other either
    const tabs = await reaches(
      head.getByRole('button', { name: /^(Problems|Output|Terminal)$/ }),
    );
    for (let i = 1; i < tabs.length; i += 1)
      expect(overlap(tabs[i - 1], tabs[i])).toBe(false);

    // a tap at the very edge of the invisible area of Close closes the panel
    await page.touchscreen.tap(close.right - 1, close.top + 1);
    await expect(page.locator('[data-slot="dev-panel"]')).toBeHidden();
  });

  test('the tools and the arrows of the picture viewer', async ({ page }) => {
    await gotoSkin(page, '/certificates');
    await page
      .getByRole('button', { name: /Claude Certified Architect/ })
      .first()
      .click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    // the window grows in: measure it when it has stopped
    await page.waitForFunction(() =>
      document
        .getAnimations()
        .every(
          (a) =>
            a.playState === 'finished' ||
            a.effect?.getComputedTiming().iterations === Infinity,
        ),
    );
    // the red, yellow and green lights are not tools (their 12 px dots have their own area)
    await expect44(
      dialog.locator(
        '[data-slot="dev-window-bar"] :is(button, a):not([data-light])',
      ),
      3,
      { square: true },
    );
    await expect44(
      dialog.getByRole('button', { name: /^(Next|Previous)/ }),
      2,
      { square: true },
    );
  });
});
