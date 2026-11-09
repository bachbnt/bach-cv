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

const stamps = (page: Page) => page.getByTestId('certificate');

/** Answers the reads of the certificates with `answer`, or waits before every read. */
async function intercept(
  page: Page,
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
      (request.postData() ?? '').includes('"collectionId":"certificates"');
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

test.describe('the passport', () => {
  test('has a cover, the identity page and one stamp for each certificate, latest first', async ({
    page,
  }) => {
    await gotoSkin(page, '/certificates');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Certificates' }),
    ).toBeVisible();
    await expect(page.getByText('Travel passport')).toBeVisible();
    await expect(
      page.getByText(
        'Professional certifications behind the skills on my resume.',
      ),
    ).toBeVisible();
    const id = page.getByRole('term').first();
    await expect(id).toBeVisible();
    await expect(page.getByRole('definition').nth(0)).toHaveText(
      'Bùi Ngô Tôn Bách',
    );
    await expect(page.getByRole('definition').nth(1)).toHaveText(
      'Software Engineer',
    );
    await expect(page.getByRole('definition').nth(2)).toContainText('Vietnam');

    await expect(stamps(page)).toHaveCount(3);
    await expect(stamps(page).getByRole('heading', { level: 2 })).toHaveText([
      'Claude Certified Architect - Professional',
      'Google Project Management Professional Certificate',
      'Google AI Professional Certificate',
    ]);
  });

  test('a stamp tells name, issuer, issue date, the skills it covers and the Latest mark', async ({
    page,
  }) => {
    await gotoSkin(page, '/certificates');
    const first = stamps(page).first();
    await expect(first).toContainText('Latest');
    await expect(first).toContainText('Anthropic');
    await expect(first).toContainText('Issued Oct 31, 2026');
    await expect(
      first.getByRole('list', { name: 'Skills covered' }),
    ).toContainText('Claude Code');
    await expect(stamps(page).nth(1)).toContainText('Google / Coursera');
    await expect(stamps(page).nth(1)).toContainText('Issued May 01, 2026');
    // only the first one is the latest
    await expect(stamps(page).filter({ hasText: 'Latest' })).toHaveCount(1);
  });

  test('the round stamp prints the issuer, the month and the year', async ({
    page,
  }) => {
    await gotoSkin(page, '/certificates');
    const round = stamps(page).nth(1).locator('[aria-hidden="true"]').first();
    await expect(round).toContainText('Google');
    await expect(round).toContainText('May');
    await expect(round).toContainText('2026');
    const box = await round.boundingBox();
    expect(Math.abs(box!.width - box!.height)).toBeLessThan(10);
  });

  test('Open PDF opens the file in a new tab instead of downloading it', async ({
    page,
  }) => {
    await gotoSkin(page, '/certificates');
    const link = stamps(page).first().getByRole('link', { name: 'Open PDF' });
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', /noopener/);
    await expect(link).toHaveAttribute('href', /\.pdf$/);
    await expect(link).not.toHaveAttribute('download', /.*/);
  });

  test('a certificate without a picture or a PDF has neither action', async ({
    page,
  }) => {
    await mockFirestore(page, {}, (collection, id, doc) =>
      collection === 'certificates' && id === 'google-ai'
        ? { ...doc, image: '', pdfUrl: '' }
        : doc,
    );
    await gotoSkin(page, '/certificates');
    const bare = stamps(page).filter({ hasText: 'Google AI Professional' });
    await expect(bare).toBeVisible();
    await expect(bare.getByRole('button')).toHaveCount(0);
    await expect(bare.getByRole('link')).toHaveCount(0);
    await expect(
      stamps(page)
        .first()
        .getByRole('button', { name: /View Claude/ }),
    ).toBeVisible();
  });
});

test.describe('the viewer', () => {
  test('the picture button opens the Standard viewer with the meta line, the PDF and the steps', async ({
    page,
  }) => {
    await gotoSkin(page, '/certificates');
    const opener = stamps(page).first().getByRole('button', {
      name: 'View Claude Certified Architect - Professional certificate',
    });
    await expect(opener.getByRole('img')).toHaveAttribute(
      'alt',
      'Claude Certified Architect - Professional certificate',
    );
    await opener.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText(
      'Claude Certified Architect - Professional',
    );
    await expect(dialog).toContainText('Anthropic, issued Oct 31, 2026');
    await expect(dialog.getByText('1 of 3', { exact: true })).toBeVisible();
    await expect(
      dialog.getByRole('link', { name: 'Open PDF' }),
    ).toHaveAttribute('href', /\.pdf$/);
    await dialog.getByRole('button', { name: 'Next certificate' }).click();
    await expect(dialog.getByText('2 of 3', { exact: true })).toBeVisible();
    await expect(dialog).toContainText('Google Project Management');
    await dialog.getByRole('button', { name: 'Previous certificate' }).click();
    await dialog.getByRole('button', { name: 'Previous certificate' }).click();
    await expect(dialog.getByText('3 of 3', { exact: true })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(opener).toBeFocused();
  });

  test('the keyboard opens the viewer from the picture button', async ({
    page,
  }) => {
    await gotoSkin(page, '/certificates');
    const opener = stamps(page)
      .nth(2)
      .getByRole('button', { name: /View Google AI/ });
    await opener.focus();
    await expect(opener).toBeFocused();
    await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText('3 of 3', { exact: true })).toBeVisible();
    await dialog.getByRole('button', { name: 'Close preview' }).click();
    await expect(dialog).toBeHidden();
  });
});

test.describe('data states', () => {
  test('a skeleton shows while the certificates are on their way, then the stamps', async ({
    page,
  }) => {
    await intercept(page, { delay: 1500 });
    await gotoSkin(page, '/certificates');
    const loading = page.getByRole('status', { name: 'Loading' }).first();
    await expect(loading).toBeVisible();
    await expect(loading).toHaveAttribute('aria-busy', 'true');
    await expect(stamps(page)).toHaveCount(3, { timeout: 15_000 });
    await expect(page.getByRole('status', { name: 'Loading' })).toHaveCount(0);
  });

  test('says there is nothing to show yet', async ({ page }) => {
    await intercept(page, 'empty');
    await gotoSkin(page, '/certificates');
    await expect(
      page.getByRole('heading', { name: 'No certificates to show yet' }),
    ).toBeVisible();
    await expect(stamps(page)).toHaveCount(0);
    // the cover stays, so the page is never blank
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Certificates',
    );
  });

  test('says it could not load, and Try again loads the stamps', async ({
    page,
  }) => {
    await intercept(page, 'error');
    await gotoSkin(page, '/certificates');
    const alert = page
      .getByRole('alert')
      .filter({ hasText: "couldn't be loaded" });
    await expect(alert).toBeVisible({ timeout: 20_000 });
    await expect(
      alert.getByRole('heading', { name: "Certificates couldn't be loaded" }),
    ).toBeVisible();
    await page.unroute('**/firestore.googleapis.com/**');
    await mockFirestore(page);
    await alert.getByRole('button', { name: 'Try again' }).click();
    await expect(stamps(page)).toHaveCount(3, { timeout: 15_000 });
  });

  test('a page switched to soon shows Coming soon', async ({ page }) => {
    await mockFirestore(page, {
      'site/live': { pages: { certificates: 'soon' } },
    });
    await gotoSkin(page, '/certificates');
    await expect(
      page.getByRole('heading', { name: 'This page is coming soon.' }),
    ).toBeVisible();
    await expect(stamps(page)).toHaveCount(0);
  });
});

test.describe('layout and motion', () => {
  for (const width of [360, 390]) {
    test(`at ${width} px nothing scrolls sideways`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await gotoSkin(page, '/certificates');
      await expect(stamps(page)).toHaveCount(3);
      const overflow = await page.evaluate(() => {
        const panel = document.querySelector('.tl-panel > div');
        return {
          page: document.documentElement.scrollWidth - window.innerWidth,
          panel: panel ? panel.scrollWidth - panel.clientWidth : 0,
        };
      });
      expect(overflow.page).toBeLessThanOrEqual(0);
      expect(overflow.panel).toBeLessThanOrEqual(0);
    });
  }

  test('on a wide screen the passport is a card at the right of the map', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await gotoSkin(page, '/certificates');
    const panel = await page.locator('.tl-panel').boundingBox();
    expect(panel!.x).toBeGreaterThan(800);
    expect(panel!.width).toBeLessThanOrEqual(440);
  });

  test('with reduced motion the stamps do not animate', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await gotoSkin(page, '/certificates');
    const name = await stamps(page)
      .first()
      .locator('.tl-stamp')
      .evaluate((el) => getComputedStyle(el).animationName);
    expect(name).toBe('none');
  });

  test('the stamps land one after another by default', async ({ page }) => {
    await gotoSkin(page, '/certificates');
    await expect(stamps(page)).toHaveCount(3);
    const delays = await page
      .locator('.tl-stamp')
      .evaluateAll((els) =>
        els.map((el) => getComputedStyle(el).animationDelay),
      );
    expect(new Set(delays).size).toBe(3);
  });
});

test.describe('on a touch screen', () => {
  test.use({ hasTouch: true, isMobile: true });

  test('the actions are at least 44 px tall', async ({ page }) => {
    await gotoSkin(page, '/certificates');
    await expect(stamps(page)).toHaveCount(3);
    const heights = await stamps(page)
      .first()
      .locator('button, a')
      .evaluateAll((els) =>
        els.map((el) => Math.round(el.getBoundingClientRect().height)),
      );
    expect(heights.length).toBeGreaterThanOrEqual(2);
    for (const height of heights) expect(height).toBeGreaterThanOrEqual(44);
  });
});

test.describe('in Vietnamese', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
  });

  test('the cover, the dates and the actions are translated', async ({
    page,
  }) => {
    await gotoSkin(page, '/certificates');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Chứng chỉ' }),
    ).toBeVisible();
    await expect(page.getByText('Hộ chiếu du lịch')).toBeVisible();
    await expect(page.getByRole('definition').nth(1)).toHaveText(
      'Kỹ sư phần mềm',
    );
    const first = stamps(page).first();
    await expect(first).toContainText('Mới nhất');
    await expect(first).toContainText('Cấp ngày 31/10/2026');
    await expect(first.locator('.tl-stamp')).toContainText('Thg 10');
    await expect(first.getByRole('link', { name: 'Mở PDF' })).toBeVisible();
    await expect(
      first.getByRole('button', { name: /Xem chứng chỉ/ }),
    ).toBeVisible();
    await expect(
      first.getByRole('list', { name: 'Kỹ năng đạt được' }),
    ).toBeVisible();
  });
});
