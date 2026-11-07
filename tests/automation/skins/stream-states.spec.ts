/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test, type Page } from '@playwright/test';
import { mockFirestore } from '../support/firestore-mock';
import { gotoSkin, useSkin } from '../support/skin';

/** The three states every block that reads data has (loading, empty, error with Try again), in the Stream skin. */
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
  {
    path: '/services',
    collection: 'services',
    empty: 'No services to show yet',
    error: "Services couldn't be loaded",
    content: 'App Development',
  },
] as const;

test.beforeEach(async ({ page }) => {
  await useSkin(page, 'stream');
  await mockFirestore(page);
});

/** Answers the reads of one collection with `answer` ('empty' or 'error'), or waits `ms` before every read. */
async function intercept(
  page: Page,
  collection: string,
  answer: 'empty' | 'error' | { delay: number },
) {
  await page.route('**/firestore.googleapis.com/**', async (route) => {
    const request = route.request();
    if (typeof answer === 'object') {
      await new Promise((resolve) => setTimeout(resolve, answer.delay));
      return route.fallback();
    }
    const mine =
      request.url().includes(':runQuery') &&
      (request.postData() ?? '').includes(`"collectionId":"${collection}"`);
    if (!mine) return route.fallback();
    return answer === 'error'
      ? route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: '{"error":{"code":500,"status":"INTERNAL"}}',
        })
      : route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([{ readTime: '2026-01-01T00:00:00Z' }]),
        });
  });
}

for (const block of BLOCKS) {
  test.describe(`${block.path} in the Stream skin`, () => {
    test('shows a skeleton while the data is on its way, then the content', async ({
      page,
    }) => {
      await intercept(page, block.collection, { delay: 1500 });
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
      await intercept(page, block.collection, 'empty');
      await gotoSkin(page, block.path);
      const notice = page.locator('[data-state="empty"]').first();
      await expect(notice).toBeVisible();
      await expect(
        notice.getByRole('heading', { name: block.empty }),
      ).toBeVisible();
      await expect(notice.getByRole('link')).toHaveCount(1);
    });

    test('says it could not load, and Try again loads it', async ({ page }) => {
      await intercept(page, block.collection, 'error');
      await gotoSkin(page, block.path);
      const alert = page.locator('[data-state="error"]').first();
      // a failed read is tried once more before it counts as an error
      await expect(alert).toBeVisible({ timeout: 20_000 });
      await expect(
        alert.getByRole('heading', { name: block.error }),
      ).toBeVisible();
      await page.unroute('**/firestore.googleapis.com/**');
      await mockFirestore(page);
      await alert.getByRole('button', { name: 'Try again' }).click();
      await expect(page.getByText(block.content).first()).toBeVisible({
        timeout: 15_000,
      });
      await expect(page.locator('[data-state="error"]')).toHaveCount(0);
    });
  });
}

test.describe('the other blocks', () => {
  test('the payment page says payments are paused when there is none', async ({
    page,
  }) => {
    await intercept(page, 'payments', 'empty');
    await gotoSkin(page, '/payment');
    await expect(
      page.getByRole('heading', { name: 'Payments are paused for now' }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Tell me about your project' }),
    ).toHaveAttribute('href', '/services#contact-cta');
  });

  test('the payment page offers Try again when it fails', async ({ page }) => {
    await intercept(page, 'payments', 'error');
    await gotoSkin(page, '/payment');
    await expect(
      page.getByRole('heading', {
        name: "The payment details couldn't be loaded",
      }),
    ).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();
  });

  test('Home leaves out the featured projects when there are none, and says so for the roles', async ({
    page,
  }) => {
    await intercept(page, 'experience', 'empty');
    await gotoSkin(page, '/');
    await expect(
      page.getByRole('heading', { name: 'No roles to show yet' }),
    ).toBeVisible();
  });

  test('the contact block of Home shows its states', async ({ page }) => {
    await intercept(page, 'contacts', 'empty');
    await gotoSkin(page, '/');
    await expect(
      page.getByRole('heading', { name: 'No contact details yet' }),
    ).toBeVisible();
  });

  test('the states are in Vietnamese', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
    await intercept(page, 'projects', 'empty');
    await gotoSkin(page, '/projects');
    await expect(
      page.getByRole('heading', { name: 'Chưa có dự án nào để hiển thị' }),
    ).toBeVisible();
  });
});

test('while the skin is on its way the page shows a loading line, not a blank page', async ({
  page,
}) => {
  let release: () => void = () => undefined;
  const gate = new Promise<void>((resolve) => (release = resolve));
  await page.route('**/*', async (route) => {
    if (/\/_next\/static\/.*skins_stream/i.test(route.request().url()))
      await gate;
    return route.fallback();
  });
  // `load` would wait for the held code, so the page counts as open as soon as it has begun
  await page.goto('/projects', { waitUntil: 'commit' });
  const html = page.locator('html');
  await expect(html).toHaveAttribute('data-skin', 'stream');
  await expect(html).not.toHaveAttribute('data-skin-ready', /.*/);
  expect(
    await page.evaluate(() => getComputedStyle(document.body).visibility),
  ).toBe('hidden');
  release();
  await expect(html).toHaveAttribute('data-skin-ready', /.*/);
  await expect(page.locator('.sm-root')).toBeVisible();
});
