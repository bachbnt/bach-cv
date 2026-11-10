/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test } from '@playwright/test';
import { mockFirestore, interceptCollection } from '../support/firestore-mock';
import { gotoSkin, useSkin } from '../support/skin';

/** The three states every block that reads data has (loading, empty, error with Try again), in the Dev skin. */
const BLOCKS = [
  {
    path: '/projects',
    collection: 'projects',
    empty: 'No projects to show yet',
    error: "Projects couldn't be loaded",
    content: 'VenusAI',
  },
  {
    path: '/resume',
    collection: 'experience',
    empty: 'No experience to show yet',
    error: "Experience couldn't be loaded",
    content: 'FPT Software',
  },
  {
    path: '/certificates',
    collection: 'certificates',
    empty: 'No certificates to show yet',
    error: "Certificates couldn't be loaded",
    content: 'Claude Certified Architect - Professional',
  },
] as const;

test.beforeEach(async ({ page }) => {
  await useSkin(page, 'dev');
  await mockFirestore(page);
});

for (const block of BLOCKS) {
  test.describe(`${block.path} in the Dev skin`, () => {
    test('shows a skeleton while the data is on its way, then the content', async ({
      page,
    }) => {
      await interceptCollection(page, block.collection, { delay: 1500 });
      await gotoSkin(page, block.path);
      const loading = page.getByRole('status', { name: 'Loading' }).first();
      await expect(loading).toBeVisible();
      await expect(loading).toHaveAttribute('aria-busy', 'true');
      await expect(page.getByText(block.content).first()).toBeVisible({
        timeout: 15_000,
      });
      await expect(page.getByRole('status', { name: 'Loading' })).toHaveCount(
        0,
      );
    });

    test('says there is nothing to show yet, with a way forward', async ({
      page,
    }) => {
      await interceptCollection(page, block.collection, 'empty');
      await gotoSkin(page, block.path);
      const notice = page.locator('[data-state="empty"]').first();
      await expect(notice).toBeVisible();
      await expect(
        notice.getByRole('heading', { name: block.empty }),
      ).toBeVisible();
      await expect(notice.getByRole('link')).toHaveCount(1);
    });

    test('says it could not load, and Try again loads it', async ({ page }) => {
      await interceptCollection(page, block.collection, 'error');
      await gotoSkin(page, block.path);
      const alert = page.locator('[data-state="error"]').first();
      // a failed read is tried once more before it counts as an error
      await expect(alert).toBeVisible({ timeout: 20_000 });
      await expect(
        alert.getByRole('heading', { name: block.error }),
      ).toBeVisible();
      // the reads work again: Try again shows the content
      await page.unroute('**/firestore.googleapis.com/**');
      await mockFirestore(page);
      await alert.getByRole('button', { name: 'Try again' }).click();
      await expect(page.getByText(block.content).first()).toBeVisible({
        timeout: 15_000,
      });
      // (the router announcer of Next.js is also an alert: look for the notice of the block)
      await expect(page.locator('[data-state="error"]')).toHaveCount(0);
    });
  });
}

test('while the skin is on its way the page shows a loading line, not a blank page', async ({
  page,
}) => {
  // hold back the code of the skin until the test lets it go (a time would make the test race with a slow machine)
  let release: () => void = () => undefined;
  const gate = new Promise<void>((resolve) => (release = resolve));
  await page.route('**/*', async (route) => {
    if (/\/_next\/static\/.*skins_dev/i.test(route.request().url())) await gate;
    return route.fallback();
  });
  // `load` would wait for the held code, so the page counts as open as soon as it has begun
  await page.goto('/projects', { waitUntil: 'commit' });
  const html = page.locator('html');
  await expect(html).toHaveAttribute('data-skin', 'dev');
  await expect(html).not.toHaveAttribute('data-skin-ready', /.*/);
  const line = () =>
    page.evaluate(() => {
      const style = getComputedStyle(document.documentElement, '::after');
      return {
        content: style.content,
        position: style.position,
        height: style.height,
        body: getComputedStyle(document.body).visibility,
      };
    });
  expect(await line()).toMatchObject({
    content: '""',
    position: 'fixed',
    height: '3px',
    body: 'hidden',
  });
  // and it is gone when the skin is on screen
  release();
  await page.locator('html[data-skin-ready]').waitFor({ timeout: 20_000 });
  expect((await line()).content).toBe('none');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});
