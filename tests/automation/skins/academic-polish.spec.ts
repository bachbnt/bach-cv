/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test } from '@playwright/test';
import { mockFirestore } from '../support/firestore-mock';
import { mockImages } from '../support/images';
import { allOn, servePayments } from '../support/payments';
import { gotoSkin, useSkin } from '../support/skin';

test.beforeEach(async ({ context, page }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await useSkin(page, 'academic');
  await mockFirestore(page);
  await mockImages(page);
});

test.describe('what an audit of the board found', () => {
  test('the toast is a slip in the window, not a line at the end of the page', async ({
    page,
  }) => {
    await servePayments(page, allOn());
    await gotoSkin(page, '/payment');
    await page.getByRole('button', { name: 'Copy number' }).first().click();
    const toast = page.getByRole('status').filter({ hasText: /copied/ });
    await expect(toast).toBeVisible();
    await expect(toast).toHaveCSS('position', 'fixed');
    const box = await toast.boundingBox();
    const viewport = page.viewportSize();
    expect(box && viewport && box.y + box.height <= viewport.height).toBe(true);
  });

  test('a sticky note is yellow', async ({ page }) => {
    await gotoSkin(page, '/services');
    const note = page.locator('.ac-sticky').first();
    await expect(note).toBeVisible();
    // a yellow gradient, not the cream of paper
    await expect(note).toHaveCSS('background-image', /rgb\(248, 231, 132\)/);
  });

  for (const width of [390, 320]) {
    test(`no page is wider than the screen at ${width} px`, async ({
      page,
    }) => {
      await servePayments(page, allOn());
      await page.setViewportSize({ width, height: 800 });
      for (const path of ['/', '/about', '/resume', '/projects', '/payment']) {
        await gotoSkin(page, path);
        const over = await page.evaluate(
          () =>
            document.documentElement.scrollWidth -
            document.documentElement.clientWidth,
        );
        expect(over, path).toBeLessThanOrEqual(0);
      }
    });
  }

  test('keys pressed one after another go on from the page they asked for', async ({
    page,
  }) => {
    await gotoSkin(page, '/projects');
    for (let i = 0; i < 3; i += 1) {
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(120);
    }
    await expect(page).toHaveURL(/\/payment$/, { timeout: 20_000 });
  });

  test('a page that scrolls to a focused control keeps it clear of the ledge', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    await expect(page.locator('html')).toHaveCSS(
      'scroll-padding-bottom',
      '96px',
    );
  });

  test('the ring of a tab is drawn inside it, so the sideways scroll of the tabs cannot cut it', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    const tab = page
      .getByRole('navigation', { name: 'Main' })
      .getByRole('link', { name: /Resume/ });
    await tab.focus();
    await expect(tab).toHaveCSS('outline-offset', '-4px');
  });

  test('the menus tick the choice with a drawn tick, and the loading state of Projects is entries not yet written', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    await page.getByRole('button', { name: /^Language/ }).click();
    const chosen = page.getByRole('menuitemradio', { name: /English/ });
    await expect(chosen.locator('svg:not(.lucide)')).toBeVisible();
    await expect(chosen.locator('svg.lucide')).toBeHidden();
    await page.keyboard.press('Escape');

    await page.unroute('**/firestore.googleapis.com/**');
    await page.route('**/firestore.googleapis.com/**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 8_000));
      await route.fallback();
    });
    await page.goto('/projects');
    const loading = page.getByRole('status', { name: 'Loading' });
    await expect(loading).toBeVisible();
    await expect(loading.locator('.ac-tape').first()).toBeVisible();
  });
});
