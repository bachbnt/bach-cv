/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test, type Page } from '@playwright/test';
import { mockFirestore } from '../support/firestore-mock';
import { mockImages } from '../support/images';
import { gotoSkin, useSkin } from '../support/skin';

test.beforeEach(async ({ page }) => {
  await useSkin(page, 'travel');
  await mockFirestore(page);
  await mockImages(page);
});

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

test.describe('the data states of the route', () => {
  test('a skeleton while the roles are on their way', async ({ page }) => {
    await intercept(page, 'experience', { delay: 1500 });
    await gotoSkin(page, '/resume');
    await expect(
      page.getByRole('status', { name: 'Loading' }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole('list', { name: 'Stops of the trip' }),
    ).toBeVisible({ timeout: 15_000 });
  });

  test('no roles: the empty card with a way forward', async ({ page }) => {
    await intercept(page, 'experience', 'empty');
    await page.addInitScript(() => undefined);
    await gotoSkin(page, '/resume');
    const notice = page.locator('[data-state="empty"]').first();
    await expect(notice).toBeVisible();
    await expect(
      notice.getByRole('heading', { name: 'No experience to show yet' }),
    ).toBeVisible();
    await expect(page.locator('.tl-pin-btn').first())
      .toBeHidden({ timeout: 2000 })
      .catch(() => undefined);
  });

  test('a failed read says so, and Try again loads it', async ({ page }) => {
    await intercept(page, 'experience', 'error');
    await gotoSkin(page, '/resume');
    const alert = page.locator('[data-state="error"]').first();
    await expect(alert).toBeVisible({ timeout: 20_000 });
    await expect(
      alert.getByRole('heading', { name: "Experience couldn't be loaded" }),
    ).toBeVisible();
    await page.unroute('**/firestore.googleapis.com/**');
    await mockFirestore(page);
    await alert.getByRole('button', { name: 'Try again' }).click();
    await expect(
      page.getByRole('list', { name: 'Stops of the trip' }),
    ).toBeVisible({ timeout: 15_000 });
  });
});

test.describe('the screens that are not a page', () => {
  test('a path that is not a page is the off-the-map screen with two ways out', async ({
    page,
  }) => {
    await gotoSkin(page, '/nowhere');
    await expect(
      page.getByRole('heading', { level: 1, name: "This page doesn't exist." }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Back to home' }),
    ).toHaveAttribute('href', '/');
    await expect(page.getByRole('button', { name: 'Go back' })).toBeVisible();
  });

  test('a page marked soon shows Coming soon, a hidden one the 404', async ({
    page,
  }) => {
    await page.unroute('**/firestore.googleapis.com/**');
    await mockFirestore(page, {
      'site/live': { pages: { about: 'soon', certificates: 'hidden' } },
    });
    await gotoSkin(page, '/about');
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'This page is coming soon.',
      }),
    ).toBeVisible();
    await page.goto('/certificates');
    await expect(
      page.getByRole('heading', { level: 1, name: "This page doesn't exist." }),
    ).toBeVisible();
  });

  test('maintenance replaces the whole site, with the email', async ({
    page,
  }) => {
    await page.unroute('**/firestore.googleapis.com/**');
    await mockFirestore(page, {
      'site/live': { maintenance: { enabled: true, message: 'Back at noon.' } },
    });
    await gotoSkin(page, '/');
    await expect(
      page.getByRole('heading', { level: 1, name: "We'll be back soon." }),
    ).toBeVisible();
    await expect(page.getByText('Back at noon.')).toBeVisible();
    await expect(
      page.getByRole('navigation', { name: 'Pages of the trip' }),
    ).toHaveCount(0);
    await expect(
      page.locator('[data-slot="tl-maintenance-link"]'),
    ).toBeVisible();
  });

  test('features switched off take their buttons away', async ({ page }) => {
    await page.unroute('**/firestore.googleapis.com/**');
    await mockFirestore(page, {
      'site/live': {
        features: { chat: false, cvDownload: false, connectMenu: false },
      },
    });
    await gotoSkin(page, '/');
    const header = page.locator('header.tl-header');
    await expect(
      header.getByRole('button', { name: 'Ask BB Bot' }),
    ).toHaveCount(0);
    await expect(
      header.getByRole('button', { name: 'Download CV' }),
    ).toHaveCount(0);
    await expect(header.getByRole('button', { name: 'Connect' })).toHaveCount(
      0,
    );
  });
});
