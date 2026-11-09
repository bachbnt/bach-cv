/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test, type Page } from '@playwright/test';
import { mockFirestore } from '../support/firestore-mock';
import { mockImages } from '../support/images';
import { allOn, servePayments } from '../support/payments';
import { gotoSkin, useSkin } from '../support/skin';

test.beforeEach(async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await useSkin(page, 'academic');
  await mockFirestore(page);
  await mockImages(page);
});

/** Answers the reads of the payments with `answer` ('error'), or waits `delay` ms before every read. */
async function intercept(
  page: Page,
  answer: 'error' | { delay: number },
): Promise<void> {
  await page.route('**/firestore.googleapis.com/**', async (route) => {
    if (typeof answer === 'object') {
      await new Promise((resolve) => setTimeout(resolve, answer.delay));
      return route.fallback();
    }
    const request = route.request();
    const mine =
      request.url().includes(':runQuery') &&
      (request.postData() ?? '').includes('"collectionId":"payments"');
    return mine
      ? route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: '{"error":{"code":500,"status":"INTERNAL"}}',
        })
      : route.fallback();
  });
}

test.describe('Payment on the board', () => {
  test('a highlighted method comes first on a card and the others follow in the table; hidden ones never show', async ({
    page,
  }) => {
    const on = allOn();
    await servePayments(page, {
      bidv: { ...on.bidv, highlight: 1 },
      momo: { ...on.momo, highlight: null },
    });
    await gotoSkin(page, '/payment');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Payment' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 2, name: 'Preferred methods' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 2, name: 'More ways to pay' }),
    ).toBeVisible();
    const card = page.getByRole('article', { name: 'BIDV' });
    await expect(card).toContainText('1234567890');
    await expect(card).toContainText('NGUYEN VAN A');
    const rows = page.getByRole('row').filter({ hasText: 'MoMo' });
    await expect(rows).toHaveCount(1);
    await expect(page.getByTestId('payment-method')).toHaveCount(2);
    await expect(page.getByText('Vietcombank')).toHaveCount(0);
    await expect(
      page.getByText(/Check the account name shown in your banking app/),
    ).toBeVisible();
  });

  test('with exactly one visible method it is shown as Payment details', async ({
    page,
  }) => {
    await servePayments(page, { bidv: allOn().bidv });
    await gotoSkin(page, '/payment');
    await expect(
      page.getByRole('heading', { level: 2, name: 'Payment details' }),
    ).toBeVisible();
    await expect(page.getByTestId('payment-method')).toHaveCount(1);
    await expect(page.getByTestId('payment-method')).toContainText('BIDV');
    await expect(page.getByRole('table')).toHaveCount(0);
  });

  test('the margin note says how many ways there are, and of which kind', async ({
    page,
  }) => {
    await servePayments(page, allOn());
    await gotoSkin(page, '/payment');
    const note = page.getByRole('complementary');
    await expect(note).toContainText('10 ways to pay');
    await expect(note).toContainText('Bank: 3');
    await expect(note).toContainText('Wallet: 7');
  });

  test('the table is filtered by bank and wallet and no label carries a count', async ({
    page,
  }) => {
    await servePayments(page, allOn());
    await gotoSkin(page, '/payment');
    const rows = page.getByRole('table').getByTestId('payment-method');
    await expect(rows).toHaveCount(8);
    const filter = page.getByRole('group', { name: 'Filter payment methods' });
    await filter.getByRole('button', { name: 'Bank' }).click();
    await expect(rows).toHaveCount(2);
    await filter.getByRole('button', { name: 'Wallet' }).click();
    await expect(rows).toHaveCount(6);
    await expect(
      filter.getByRole('button', { name: 'All', exact: true }),
    ).toHaveText('All');
    await expect(
      filter.getByRole('button', { name: 'Wallet' }),
    ).toHaveAttribute('aria-pressed', 'true');
    await filter.getByRole('button', { name: 'All', exact: true }).click();
    await expect(rows).toHaveCount(8);
  });

  test('copy buttons write to the clipboard and say so', async ({ page }) => {
    await servePayments(page, allOn());
    await gotoSkin(page, '/payment');
    const toast = page.getByRole('status').filter({ hasText: /copied/ });

    const bidv = page.getByRole('article', { name: 'BIDV' });
    await bidv.getByRole('button', { name: 'Copy number' }).click();
    await expect(toast).toHaveText('BIDV account number copied');
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      '1234567890',
    );

    await bidv.getByRole('button', { name: 'Copy all details' }).click();
    await expect(toast).toHaveText('BIDV details copied');
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      'BIDV\nAccount name: NGUYEN VAN A\nAccount number: 1234567890',
    );

    const row = page.getByRole('table').getByTestId('payment-method').first();
    await row.getByRole('button', { name: 'Copy number' }).click();
    await expect(toast).toContainText('account number copied');
  });

  test('the QR code opens in the viewer, which copies, steps through the methods and returns focus', async ({
    page,
  }) => {
    await servePayments(page, allOn());
    await gotoSkin(page, '/payment');
    const opener = page.getByRole('button', { name: 'Enlarge BIDV QR code' });
    await opener.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toContainText('BIDV QR code');
    await expect(dialog).toContainText('NGUYEN VAN A');
    await dialog.getByRole('button', { name: 'Copy number' }).click();
    await expect(
      page.getByRole('status').filter({ hasText: /copied/ }),
    ).toHaveText('BIDV account number copied');
    await page.keyboard.press('ArrowRight');
    await expect(dialog).toContainText('MoMo QR code');
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(opener).toBeFocused();
  });

  test('the viewer saves the QR code like Standard, or opens it when the browser blocks the download', async ({
    page,
  }) => {
    await servePayments(page, allOn());
    await gotoSkin(page, '/payment');
    await page.getByRole('button', { name: 'Enlarge BIDV QR code' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('button', { name: 'Save QR' }).click();
    // the picture is on another origin: Standard says it saved it, or that it opened it when that was refused
    await expect(
      page.getByRole('status').filter({ hasText: /QR code (saved|opened)/ }),
    ).toBeVisible();
  });

  test('a row with a QR code has a button for it that opens that code, and a row without one has none', async ({
    page,
  }) => {
    const on = allOn();
    await servePayments(page, {
      bidv: on.bidv,
      momo: { ...on.momo, highlight: null },
      paypal: { ...on.paypal, highlight: null, qr: '' },
    });
    await gotoSkin(page, '/payment');
    await expect(
      page.getByRole('button', { name: 'Show PayPal QR code' }),
    ).toHaveCount(0);
    await page.getByRole('button', { name: 'Show MoMo QR code' }).click();
    await expect(page.getByRole('dialog')).toContainText('MoMo QR code');
  });

  test('with no method it says payments are paused and points to the contact form', async ({
    page,
  }) => {
    await servePayments(page, {});
    await gotoSkin(page, '/payment');
    await expect(
      page.getByRole('heading', { name: 'Payments are paused for now' }),
    ).toBeVisible();
    await expect(page.getByTestId('payment-method')).toHaveCount(0);
    await expect(page.getByText(/Check the account name/)).toHaveCount(0);
    await expect(
      page.getByRole('link', { name: 'Tell me about your project' }),
    ).toHaveAttribute('href', '/services#contact-cta');
  });

  test('shows a skeleton while the data is on its way, then the methods', async ({
    page,
  }) => {
    await servePayments(page, allOn());
    await intercept(page, { delay: 1500 });
    await gotoSkin(page, '/payment');
    const loading = page.getByRole('status', { name: 'Loading' });
    await expect(loading).toBeVisible();
    await expect(loading).toHaveAttribute('aria-busy', 'true');
    await expect(page.getByTestId('payment-method').first()).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByRole('status', { name: 'Loading' })).toHaveCount(0);
  });

  test('says it could not load, and Try again loads it', async ({ page }) => {
    await intercept(page, 'error');
    await gotoSkin(page, '/payment');
    const alert = page.locator('[data-state="error"]');
    // a failed read is tried once more before it counts as an error
    await expect(alert).toBeVisible({ timeout: 20_000 });
    await expect(
      alert.getByRole('heading', {
        name: "The payment details couldn't be loaded",
      }),
    ).toBeVisible();
    await page.unroute('**/firestore.googleapis.com/**');
    await mockFirestore(page);
    await servePayments(page, allOn());
    await alert.getByRole('button', { name: 'Try again' }).click();
    await expect(page.getByTestId('payment-method').first()).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.locator('[data-state="error"]')).toHaveCount(0);
  });

  test('a page that is soon shows Coming soon, and a hidden one the 404', async ({
    page,
  }) => {
    await mockFirestore(page, { 'site/live': { pages: { payment: 'soon' } } });
    await gotoSkin(page, '/payment');
    await expect(
      page.getByRole('heading', { level: 1, name: /coming soon/i }),
    ).toBeVisible();
    await expect(page.getByTestId('payment-method')).toHaveCount(0);

    await page.unroute('**/firestore.googleapis.com/**');
    await mockFirestore(page, {
      'site/live': { pages: { payment: 'hidden' } },
    });
    await gotoSkin(page, '/payment');
    await expect(
      page.getByRole('heading', { level: 1, name: /doesn't exist/i }),
    ).toBeVisible();
  });

  test('on a phone the page does not scroll sideways', async ({ page }) => {
    await servePayments(page, allOn());
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoSkin(page, '/payment');
    await expect(page.getByTestId('payment-method').first()).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  });

  test('in Vietnamese the labels, the margin note and the toast are translated', async ({
    page,
  }) => {
    await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
    await servePayments(page, { bidv: allOn().bidv });
    await gotoSkin(page, '/payment');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Thanh toán' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 2, name: 'Thông tin thanh toán' }),
    ).toBeVisible();
    await expect(page.getByRole('complementary')).toContainText(
      '1 cách thanh toán',
    );
    await expect(
      page.getByText('Tên tài khoản', { exact: true }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Sao chép số' }).click();
    await expect(
      page.getByRole('status').filter({ hasText: /Đã sao chép/ }),
    ).toHaveText('Đã sao chép số tài khoản BIDV');
  });

  test('in Vietnamese the paused state is translated', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
    await servePayments(page, {});
    await gotoSkin(page, '/payment');
    await expect(
      page.getByRole('heading', { name: 'Hiện tạm dừng nhận thanh toán' }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Cho tôi biết về dự án của bạn' }),
    ).toHaveAttribute('href', '/services#contact-cta');
  });
});
