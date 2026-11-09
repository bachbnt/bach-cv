/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test } from '@playwright/test';
import { mockFirestore } from '../support/firestore-mock';
import { gotoSkin, useSkin } from '../support/skin';

test.beforeEach(async ({ page }) => {
  await useSkin(page, 'academic');
  await mockFirestore(page);
});

test.describe('the board', () => {
  test('has a tab for every page with the Standard names, and the open one is marked', async ({
    page,
  }) => {
    await gotoSkin(page, '/projects');
    const tabs = page.getByRole('navigation', { name: 'Main' });
    await expect(tabs.getByRole('link')).toHaveCount(7);
    await expect(tabs.getByRole('link', { name: /Projects/ })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(page.locator('html')).toHaveAttribute('data-skin', 'academic');
  });

  test('the language, skin and theme menus are in the header, and the skin menu leads back to Standard', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    await expect(page.getByRole('button', { name: /^Language/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Theme/ })).toBeVisible();
    await page.getByRole('button', { name: /^Skin/ }).click();
    await page.getByRole('menuitemradio', { name: /Standard/ }).click();
    await expect(page.locator('html')).not.toHaveAttribute(
      'data-skin',
      'academic',
    );
  });

  test('turns the page with the arrow keys and the foot of the page', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    // the first visit to a route compiles it in the dev server, which can take a while when other tests run
    const arrived = { timeout: 20_000 };
    await page.keyboard.press('ArrowRight');
    await expect(page).toHaveURL(/\/about$/, arrived);
    await page.getByRole('link', { name: /^Next page: Resume/ }).click();
    await expect(page).toHaveURL(/\/resume$/, arrived);
    await page.keyboard.press('ArrowLeft');
    await expect(page).toHaveURL(/\/about$/, arrived);
  });
});
