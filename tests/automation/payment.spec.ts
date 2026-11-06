/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test } from '@playwright/test';
import { mockFirestore } from './support/firestore-mock';
import { allOn, servePayments } from './support/payments';

test.beforeEach(async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await mockFirestore(page);
});

test('a highlighted method comes first and the others follow; hidden ones never show', async ({
  page,
}) => {
  // BIDV highlighted, MoMo on; Vietcombank is not served at all (the rules would not return a hidden one)
  const on = allOn();
  await servePayments(page, {
    bidv: { ...on.bidv, highlight: 1 },
    momo: { ...on.momo, highlight: null },
  });
  await page.goto('/payment');
  await expect(
    page.getByRole('heading', { level: 2, name: 'Preferred methods' }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { level: 2, name: 'More ways to pay' }),
  ).toBeVisible();
  const methods = page.getByTestId('payment-method');
  await expect(methods).toHaveCount(2);
  await expect(methods.first()).toContainText('BIDV');
  await expect(methods.first()).toContainText('1234567890');
  await expect(methods.nth(1)).toContainText('MoMo');
  await expect(page.getByText('Vietcombank')).toHaveCount(0);
  await expect(
    page.getByText(/Check the account name shown in your banking app/),
  ).toBeVisible();
});

test('with exactly one visible method it is shown as Payment details', async ({
  page,
}) => {
  await servePayments(page, { bidv: allOn().bidv });
  await page.goto('/payment');
  await expect(
    page.getByRole('heading', { level: 2, name: 'Payment details' }),
  ).toBeVisible();
  await expect(page.getByTestId('payment-method')).toHaveCount(1);
  await expect(page.getByTestId('payment-method')).toContainText('BIDV');
});

test('highlighted methods come first, then More ways to pay with a filter', async ({
  page,
}) => {
  await servePayments(page, allOn());
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/payment');

  await expect(
    page.getByRole('heading', { level: 2, name: 'Preferred methods' }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { level: 2, name: 'More ways to pay' }),
  ).toBeVisible();
  const featured = page.locator('article[data-testid="payment-method"]');
  await expect(featured).toHaveCount(2);
  await expect(featured.first()).toContainText('BIDV');
  await expect(featured.nth(1)).toContainText('MoMo');
  const rows = page.locator('li[data-testid="payment-method"]');
  await expect(rows).toHaveCount(8);

  const filter = page.getByRole('group', { name: 'Filter payment methods' });
  await filter.getByRole('button', { name: /^Bank/ }).click();
  await expect(rows).toHaveCount(2);
  await filter.getByRole('button', { name: /^Wallet/ }).click();
  await expect(rows).toHaveCount(6);
  await filter.getByRole('button', { name: /^All/ }).click();
  await expect(rows).toHaveCount(8);
});

test('copy buttons write to the clipboard and show a toast', async ({
  page,
}) => {
  await servePayments(page, allOn());
  await page.goto('/payment');

  const bidv = page.locator('article[data-testid="payment-method"]').first();
  await bidv.getByRole('button', { name: 'Copy number' }).click();
  await expect(
    page.getByRole('status').filter({ hasText: /copied/ }),
  ).toHaveText('BIDV account number copied');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    '1234567890',
  );

  await bidv.getByRole('button', { name: 'Copy all details' }).click();
  await expect(page.getByTestId('payment-toast')).toHaveText(
    'BIDV details copied',
  );
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    'BIDV\nAccount name: NGUYEN VAN A\nAccount number: 1234567890',
  );

  const row = page.locator('li[data-testid="payment-method"]').first();
  await row.getByRole('button', { name: 'Copy number' }).click();
  await expect(page.getByTestId('payment-toast')).toContainText('copied');
});

test('the QR dialog zooms, copies, steps through methods with the keyboard and returns focus', async ({
  page,
}) => {
  await servePayments(page, allOn());
  await page.goto('/payment');

  const opener = page.getByRole('button', { name: 'Enlarge BIDV QR code' });
  await opener.click();
  const dialog = page.getByRole('dialog');
  await expect(
    dialog.getByRole('heading', { name: 'BIDV QR code' }),
  ).toBeVisible();
  await expect(dialog).toContainText('NGUYEN VAN A');
  await expect(
    dialog.getByRole('img', { name: 'BIDV payment QR code' }),
  ).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Save QR' })).toBeVisible();

  await dialog.getByRole('button', { name: 'Copy number' }).click();
  await expect(page.getByTestId('payment-toast')).toHaveText(
    'BIDV account number copied',
  );

  await page.keyboard.press('ArrowRight');
  await expect(
    dialog.getByRole('heading', { name: 'MoMo QR code' }),
  ).toBeVisible();
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('ArrowLeft');
  await expect(
    dialog.getByRole('heading', { name: /QR code$/ }),
  ).not.toHaveText('BIDV QR code');

  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(opener).toBeFocused();
});

test('with no method on it says payments are paused and points to the contact form', async ({
  page,
}) => {
  await servePayments(page, {});
  await page.goto('/payment');

  await expect(
    page.getByRole('heading', { name: 'Payments are paused for now' }),
  ).toBeVisible();
  await expect(page.getByTestId('payment-method')).toHaveCount(0);
  await expect(page.getByText(/Check the account name/)).toHaveCount(0);
  await expect(
    page.getByRole('link', { name: 'Tell me about your project' }),
  ).toHaveAttribute('href', '/services#contact-cta');
});

test('on a phone the page does not scroll sideways', async ({ page }) => {
  await servePayments(page, allOn());
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/payment');
  await expect(page.getByTestId('payment-method').first()).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test('in Vietnamese the labels and the toast are translated', async ({
  page,
}) => {
  await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
  await servePayments(page, { bidv: allOn().bidv });
  await page.goto('/payment');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Thanh toán' }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { level: 2, name: 'Thông tin thanh toán' }),
  ).toBeVisible();
  await expect(page.getByText('Tên tài khoản', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Sao chép số' }).click();
  await expect(page.getByTestId('payment-toast')).toHaveText(
    'Đã sao chép số tài khoản BIDV',
  );
});

test('in Vietnamese the paused state is translated', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
  await servePayments(page, {});
  await page.goto('/payment');
  await expect(
    page.getByRole('heading', { name: 'Hiện tạm dừng nhận thanh toán' }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Cho tôi biết về dự án của bạn' }),
  ).toHaveAttribute('href', '/services#contact-cta');
});
