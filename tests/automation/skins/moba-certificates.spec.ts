/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test, type Page } from '@playwright/test';
import { mockFirestore } from '../support/firestore-mock';
import { gotoSkin, useSkin } from '../support/skin';

test.beforeEach(async ({ page }) => {
  await useSkin(page, 'moba');
  await mockFirestore(page);
});

const LATEST = 'Claude Certified Architect - Professional';
const PM = 'Google Project Management Professional Certificate';
const AI = 'Google AI Professional Certificate';

const slots = (page: Page) =>
  page.getByRole('group', { name: 'Certificate slots' }).getByRole('button');
const slot = (page: Page, name: string) =>
  page
    .getByRole('group', { name: 'Certificate slots' })
    .getByRole('button', { name });
const detail = (page: Page) => page.getByTestId('certificate');

test.describe('Certificates in the Moba skin', () => {
  test('has the title and intro and a slot for every certificate, latest issued first', async ({
    page,
  }) => {
    await gotoSkin(page, '/certificates');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Certificates' }),
    ).toBeVisible();
    await expect(
      page.getByText(
        'Professional certifications behind the skills on my resume.',
      ),
    ).toBeVisible();
    await expect(slots(page)).toHaveCount(3);
    await expect(slots(page)).toHaveText([LATEST, PM, AI]);
    await expect(slots(page).first()).toHaveAttribute('aria-pressed', 'true');
    await expect(slots(page).nth(1)).toHaveAttribute('aria-pressed', 'false');
  });

  test('the latest is chosen first and its card has the name, date, issuer, skills, picture and PDF', async ({
    page,
  }) => {
    await gotoSkin(page, '/certificates');
    await expect(detail(page)).toHaveCount(1);
    await expect(
      detail(page).getByRole('heading', { level: 2, name: LATEST }),
    ).toBeVisible();
    await expect(
      detail(page).getByText('Latest', { exact: true }),
    ).toBeVisible();
    await expect(detail(page).getByText('Issued Oct 31, 2026')).toBeVisible();
    await expect(
      detail(page).getByText('Anthropic', { exact: true }),
    ).toBeVisible();
    const skills = detail(page).getByRole('list', { name: 'Skills covered' });
    await expect(skills.getByRole('listitem')).toHaveText([
      'Claude Code',
      'MCP',
      'AI agents',
    ]);
    await expect(
      detail(page).getByRole('img', { name: `${LATEST} certificate` }),
    ).toBeVisible();
    await expect(
      detail(page).getByRole('button', { name: `View ${LATEST} certificate` }),
    ).toBeVisible();
    const pdf = detail(page).getByRole('link', { name: 'Open PDF' });
    await expect(pdf).toHaveAttribute('href', /\.pdf$/);
    await expect(pdf).toHaveAttribute('target', '_blank');
    await expect(pdf).toHaveAttribute('rel', /noopener/);
    await expect(pdf).not.toHaveAttribute('download', /.*/);
    // no credential link when the certificate has none
    await expect(
      detail(page).getByRole('link', { name: 'View credential' }),
    ).toHaveCount(0);
  });

  test('choosing another slot shows its card, and every certificate can be chosen', async ({
    page,
  }) => {
    await gotoSkin(page, '/certificates');
    await slot(page, PM).click();
    await expect(slot(page, PM)).toHaveAttribute('aria-pressed', 'true');
    await expect(slot(page, LATEST)).toHaveAttribute('aria-pressed', 'false');
    await expect(
      detail(page).getByRole('heading', { level: 2, name: PM }),
    ).toBeVisible();
    await expect(detail(page).getByText('Issued May 01, 2026')).toBeVisible();
    await expect(
      detail(page).getByText('Google / Coursera', { exact: true }),
    ).toBeVisible();
    await expect(
      detail(page)
        .getByRole('list', { name: 'Skills covered' })
        .getByRole('listitem'),
    ).toHaveText(['Project planning', 'Agile', 'Risk management']);
    // only the latest carries the Latest tag
    await expect(detail(page).getByText('Latest', { exact: true })).toHaveCount(
      0,
    );
    await slot(page, AI).click();
    await expect(detail(page).getByText('Issued Apr 30, 2026')).toBeVisible();
    await expect(
      detail(page).getByRole('link', { name: 'Open PDF' }),
    ).toHaveAttribute('href', /\.pdf$/);
  });

  test('a credential link shows when the certificate has one', async ({
    page,
  }) => {
    await mockFirestore(page, {}, (collection, id, doc) =>
      collection === 'certificates' && id === 'claude-architect'
        ? { ...doc, credentialUrl: 'https://example.com/credential/1' }
        : doc,
    );
    await gotoSkin(page, '/certificates');
    const link = detail(page).getByRole('link', { name: 'View credential' });
    await expect(link).toHaveAttribute(
      'href',
      'https://example.com/credential/1',
    );
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', /noopener/);
  });

  test('a certificate without a PDF has no Open PDF link', async ({ page }) => {
    await mockFirestore(page, {}, (collection, id, doc) =>
      collection === 'certificates' && id === 'claude-architect'
        ? { ...doc, pdfUrl: '' }
        : doc,
    );
    await gotoSkin(page, '/certificates');
    await expect(
      detail(page).getByRole('heading', { name: LATEST }),
    ).toBeVisible();
    await expect(
      detail(page).getByRole('link', { name: 'Open PDF' }),
    ).toHaveCount(0);
  });

  test('the picture opens the viewer with the Standard names, steps through every certificate, and gives focus back', async ({
    page,
  }) => {
    await gotoSkin(page, '/certificates');
    const opener = detail(page).getByRole('button', {
      name: `View ${LATEST} certificate`,
    });
    await opener.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(LATEST)).toBeVisible();
    await expect(
      dialog.getByText('Anthropic, issued Oct 31, 2026'),
    ).toBeVisible();
    await expect(dialog.getByText('1 of 3', { exact: true })).toBeVisible();
    await expect(
      dialog.getByRole('img', { name: `${LATEST} certificate` }),
    ).toBeVisible();
    await expect(
      dialog.getByRole('link', { name: 'Open PDF' }),
    ).toHaveAttribute('href', /\.pdf$/);
    await expect(
      dialog.getByRole('button', { name: 'Close preview' }),
    ).toBeVisible();
    await expect(
      dialog.getByRole('button', { name: 'Previous certificate' }),
    ).toBeVisible();
    await dialog.getByRole('button', { name: 'Next certificate' }).click();
    await expect(dialog.getByText('2 of 3', { exact: true })).toBeVisible();
    await expect(
      dialog.getByText('Google / Coursera, issued May 01, 2026'),
    ).toBeVisible();
    // the arrow keys step while focus is in the dialog body
    await page.keyboard.press('ArrowRight');
    await expect(dialog.getByText('3 of 3', { exact: true })).toBeVisible();
    await page.keyboard.press('ArrowRight');
    await expect(dialog.getByText('1 of 3', { exact: true })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(opener).toBeFocused();
  });

  test('the viewer opens at the certificate that was chosen', async ({
    page,
  }) => {
    await gotoSkin(page, '/certificates');
    await slot(page, AI).click();
    await detail(page)
      .getByRole('button', { name: `View ${AI} certificate` })
      .click();
    await expect(
      page.getByRole('dialog').getByText('3 of 3', { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('dialog').getByRole('img', { name: `${AI} certificate` }),
    ).toBeVisible();
  });

  test('every certificate and its links are reachable with the keyboard', async ({
    page,
  }) => {
    await gotoSkin(page, '/certificates');
    await slot(page, LATEST).focus();
    await page.keyboard.press('Tab');
    await expect(slot(page, PM)).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(slot(page, PM)).toHaveAttribute('aria-pressed', 'true');
    await expect(detail(page).getByRole('heading', { name: PM })).toBeVisible();
    await page.keyboard.press('Tab');
    await expect(slot(page, AI)).toBeFocused();
    await page.keyboard.press('Space');
    await expect(detail(page).getByRole('heading', { name: AI })).toBeVisible();
    await page.keyboard.press('Tab');
    await expect(
      detail(page).getByRole('button', { name: `View ${AI} certificate` }),
    ).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(
      detail(page).getByRole('link', { name: 'Open PDF' }),
    ).toBeFocused();
    // Enter on the picture opens the viewer
    await detail(page)
      .getByRole('button', { name: `View ${AI} certificate` })
      .focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('an item slot of the champion bar chooses that certificate and scrolls to it', async ({
    page,
  }) => {
    await gotoSkin(page, '/certificates');
    await expect(slot(page, LATEST)).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('button', { name: `Certificate 3: ${AI}` }).click();
    await expect(slot(page, AI)).toHaveAttribute('aria-pressed', 'true');
    await expect(detail(page).getByRole('heading', { name: AI })).toBeVisible();
    await expect(slot(page, AI)).toBeInViewport();
    // it happens once: the choice of the visitor afterwards stays
    await slot(page, PM).click();
    await expect(slot(page, PM)).toHaveAttribute('aria-pressed', 'true');
    await expect(slot(page, AI)).toHaveAttribute('aria-pressed', 'false');
  });

  test('shows a skeleton while the data is on its way', async ({ page }) => {
    await page.route('**/firestore.googleapis.com/**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return route.fallback();
    });
    await gotoSkin(page, '/certificates');
    const loading = page.getByRole('status', { name: 'Loading' }).first();
    await expect(loading).toBeVisible();
    await expect(loading).toHaveAttribute('aria-busy', 'true');
    await expect(slot(page, LATEST)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('status', { name: 'Loading' })).toHaveCount(0);
  });

  test('says there is nothing to show yet', async ({ page }) => {
    await page.route('**/firestore.googleapis.com/**', (route) => {
      const request = route.request();
      if (
        request.url().includes(':runQuery') &&
        (request.postData() ?? '').includes('"collectionId":"certificates"')
      )
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([{ readTime: '2026-11-04T00:00:00.000000Z' }]),
        });
      return route.fallback();
    });
    await gotoSkin(page, '/certificates');
    await expect(
      page
        .locator('[data-state="empty"]')
        .getByRole('heading', { name: 'No certificates to show yet' }),
    ).toBeVisible();
    await expect(slots(page)).toHaveCount(0);
  });

  test('says it could not load, and Try again loads it', async ({ page }) => {
    await page.route('**/firestore.googleapis.com/**', (route) => {
      const request = route.request();
      if (
        request.url().includes(':runQuery') &&
        (request.postData() ?? '').includes('"collectionId":"certificates"')
      )
        return route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: '{"error":{"code":500,"status":"INTERNAL"}}',
        });
      return route.fallback();
    });
    await gotoSkin(page, '/certificates');
    const alert = page.locator('[data-state="error"]').first();
    await expect(alert).toBeVisible({ timeout: 20_000 });
    await expect(
      alert.getByRole('heading', { name: "Certificates couldn't be loaded" }),
    ).toBeVisible();
    await page.unroute('**/firestore.googleapis.com/**');
    await mockFirestore(page);
    await alert.getByRole('button', { name: 'Try again' }).click();
    await expect(slot(page, LATEST)).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('[data-state="error"]')).toHaveCount(0);
  });

  test('a page that is soon shows Coming soon', async ({ page }) => {
    await mockFirestore(page, {
      'site/live': { pages: { certificates: 'soon' } },
    });
    await gotoSkin(page, '/certificates');
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'This page is coming soon.',
      }),
    ).toBeVisible();
    await expect(slots(page)).toHaveCount(0);
  });

  test('a page that is hidden shows the 404', async ({ page }) => {
    await mockFirestore(page, {
      'site/live': { pages: { certificates: 'hidden' } },
    });
    await gotoSkin(page, '/certificates');
    await expect(
      page.getByRole('heading', { level: 1, name: "This page doesn't exist." }),
    ).toBeVisible();
    await expect(slots(page)).toHaveCount(0);
  });

  test('in Vietnamese the page, the dates and the viewer are translated', async ({
    page,
  }) => {
    await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
    await gotoSkin(page, '/certificates');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Chứng chỉ' }),
    ).toBeVisible();
    await expect(
      page.getByRole('group', { name: 'Các ô chứng chỉ' }),
    ).toBeVisible();
    await expect(
      detail(page).getByText('Mới nhất', { exact: true }),
    ).toBeVisible();
    await expect(detail(page).getByText('Cấp ngày 31/10/2026')).toBeVisible();
    await expect(
      detail(page).getByRole('list', { name: 'Kỹ năng đạt được' }),
    ).toBeVisible();
    await expect(
      detail(page).getByRole('link', { name: 'Mở PDF' }),
    ).toBeVisible();
    await detail(page)
      .getByRole('button', { name: /^Xem chứng chỉ / })
      .click();
    const dialog = page.getByRole('dialog');
    await expect(
      dialog.getByRole('button', { name: 'Đóng xem trước' }),
    ).toBeVisible();
    await expect(
      dialog.getByRole('button', { name: 'Chứng chỉ tiếp theo' }),
    ).toBeVisible();
    await expect(
      dialog.getByText('Anthropic, cấp ngày 31/10/2026'),
    ).toBeVisible();
  });

  for (const [width, height] of [
    [360, 740],
    [390, 844],
  ] as const)
    test(`at ${width}px nothing overflows sideways`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.addInitScript(() =>
        localStorage.setItem('bach-cv-lang', 'vi'),
      );
      await gotoSkin(page, '/certificates');
      await expect(detail(page)).toBeVisible();
      const widest = await page.evaluate(() =>
        Math.max(
          ...[
            ...document.querySelectorAll(
              '[data-testid="certificate"], #inventory li, h1, h2',
            ),
          ].map((el) => el.getBoundingClientRect().right),
        ),
      );
      expect(widest).toBeLessThanOrEqual(width + 0.5);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
    });
});
