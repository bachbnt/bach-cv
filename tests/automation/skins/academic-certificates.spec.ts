/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test, type Page } from '@playwright/test';
import { mockFirestore } from '../support/firestore-mock';
import { gotoSkin, useSkin } from '../support/skin';

const LATEST = 'Claude Certified Architect - Professional';

test.beforeEach(async ({ page }) => {
  await useSkin(page, 'academic');
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

test.describe('the certificates', () => {
  test('are reviewer cards, newest first, with the issuer, the date and what they cover', async ({
    page,
  }) => {
    await gotoSkin(page, '/certificates');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Certificates',
    );
    const cards = page.getByTestId('certificate');
    await expect(cards).toHaveCount(3);
    // newest first, whatever the order of the documents
    await expect(cards.nth(0).getByRole('heading', { level: 2 })).toHaveText(
      LATEST,
    );
    await expect(cards.nth(1).getByRole('heading', { level: 2 })).toHaveText(
      'Google Project Management Professional Certificate',
    );
    await expect(cards.nth(2).getByRole('heading', { level: 2 })).toHaveText(
      'Google AI Professional Certificate',
    );
    const first = cards.nth(0);
    await expect(first).toContainText('Anthropic');
    await expect(first).toContainText('Issued Oct 31, 2026');
    await expect(
      first.getByRole('list', { name: 'Skills covered' }).getByRole('listitem'),
    ).toHaveText(['Claude Code', 'MCP', 'AI agents']);
    // only the newest carries the Standard word for it
    await expect(page.getByText('Latest', { exact: true })).toHaveCount(1);
    await expect(first.getByText('Latest', { exact: true })).toBeVisible();
  });

  test('say in the margin how many there are and when the latest was issued', async ({
    page,
  }) => {
    await gotoSkin(page, '/certificates');
    await expect(
      page.getByText('3 certificates · latest Oct 31, 2026'),
    ).toBeVisible();
  });

  test('open the picture in the viewer, which steps through them all', async ({
    page,
  }) => {
    await gotoSkin(page, '/certificates');
    await page
      .getByRole('button', {
        name: 'View Google Project Management Professional Certificate certificate',
      })
      .click();
    const dialog = page.getByRole('dialog');
    await expect(
      dialog.getByText('Google Project Management Professional Certificate'),
    ).toBeVisible();
    await dialog.getByRole('button', { name: 'Next certificate' }).click();
    await expect(
      dialog.getByText('Google AI Professional Certificate'),
    ).toBeVisible();
    await dialog.getByRole('button', { name: 'Close preview' }).click();
    await expect(dialog).toBeHidden();
  });

  test('keep Open PDF on the card, opening in a new tab', async ({ page }) => {
    await gotoSkin(page, '/certificates');
    const pdf = page
      .getByTestId('certificate')
      .first()
      .getByRole('link', { name: /Open PDF/ });
    await expect(pdf).toHaveAttribute('href', /claude-architect\.pdf$/);
    await expect(pdf).toHaveAttribute('target', '_blank');
    await expect(pdf).toHaveAttribute('rel', /noopener/);
  });

  test('have no horizontal scroll on a phone', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoSkin(page, '/certificates');
    await expect(page.getByTestId('certificate')).toHaveCount(3);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  });
});

test.describe('the states of the page', () => {
  test('a skeleton shows while the data is on its way, then the content', async ({
    page,
  }) => {
    await intercept(page, 'certificates', { delay: 1500 });
    await gotoSkin(page, '/certificates');
    const loading = page.getByRole('status', { name: 'Loading' }).first();
    await expect(loading).toBeVisible();
    await expect(loading).toHaveAttribute('aria-busy', 'true');
    await expect(page.getByText(LATEST).first()).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByRole('status', { name: 'Loading' })).toHaveCount(0);
  });

  test('says there is nothing to show yet, with a way forward', async ({
    page,
  }) => {
    await intercept(page, 'certificates', 'empty');
    await gotoSkin(page, '/certificates');
    const notice = page.locator('[data-state="empty"]');
    await expect(
      notice.getByRole('heading', { name: 'No certificates to show yet' }),
    ).toBeVisible();
    await expect(notice.getByRole('link')).toHaveCount(1);
  });

  test('says it could not load, and Try again loads it', async ({ page }) => {
    await intercept(page, 'certificates', 'error');
    await gotoSkin(page, '/certificates');
    const alert = page.locator('[data-state="error"]');
    // a failed read is tried once more before it counts as an error
    await expect(alert).toBeVisible({ timeout: 20_000 });
    await expect(
      alert.getByRole('heading', { name: "Certificates couldn't be loaded" }),
    ).toBeVisible();
    await page.unroute('**/firestore.googleapis.com/**');
    await mockFirestore(page);
    await alert.getByRole('button', { name: 'Try again' }).click();
    await expect(page.getByText(LATEST).first()).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.locator('[data-state="error"]')).toHaveCount(0);
  });

  test('a page that is coming soon says so, a hidden one is not found', async ({
    page,
  }) => {
    await mockFirestore(page, {
      'site/live': { pages: { certificates: 'soon' } },
    });
    await gotoSkin(page, '/certificates');
    await expect(
      page.getByRole('heading', { name: 'This page is coming soon.' }),
    ).toBeVisible();

    await page.unroute('**/firestore.googleapis.com/**');
    await mockFirestore(page, {
      'site/live': { pages: { certificates: 'hidden' } },
    });
    await gotoSkin(page, '/certificates');
    await expect(
      page.getByRole('heading', { name: "This page doesn't exist." }),
    ).toBeVisible();
    await expect(
      page
        .getByRole('navigation', { name: 'Main' })
        .getByRole('link', { name: 'Certificates' }),
    ).toHaveCount(0);
  });
});

test.describe('in Vietnamese', () => {
  test('shows the words of Vietnamese Standard and of the skin', async ({
    page,
  }) => {
    await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
    await gotoSkin(page, '/certificates');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Chứng chỉ',
    );
    const first = page.getByTestId('certificate').first();
    await expect(first).toContainText('Cấp ngày 31/10/2026');
    await expect(first).toContainText('Cấp bởi');
    await expect(first.getByRole('link', { name: /Mở PDF/ })).toBeVisible();
    await expect(
      page.getByText('3 chứng chỉ · mới nhất 31/10/2026'),
    ).toBeVisible();
    await expect(page.getByText('Mới nhất', { exact: true })).toHaveCount(1);
  });
});
