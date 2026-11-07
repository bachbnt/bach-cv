/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test } from '@playwright/test';
import { mockFirestore } from '../support/firestore-mock';
import { mockImages } from '../support/images';
import { allOn, servePayments } from '../support/payments';
import { gotoSkin, useSkin } from '../support/skin';

test.beforeEach(async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await useSkin(page, 'trade');
  await mockFirestore(page);
  await mockImages(page);
});

test.describe('Payment as the deposit methods', () => {
  test('puts the highlighted methods first as the recommended ones, with a QR thumbnail, and the others as rows of a table', async ({
    page,
  }) => {
    await servePayments(page, allOn());
    await gotoSkin(page, '/payment');
    const preferred = page.getByRole('region', { name: 'Preferred methods' });
    await expect(preferred.getByTestId('payment-method')).toHaveCount(2);
    await expect(preferred.getByText('Recommended')).toHaveCount(2);
    await expect(
      preferred.getByRole('button', { name: 'Enlarge BIDV QR code' }),
    ).toBeVisible();
    await expect(
      preferred.getByRole('img', { name: 'BIDV payment QR code' }),
    ).toBeVisible();
    await expect(preferred.getByText('1234567890')).toBeVisible();
    const more = page.getByRole('region', { name: 'More ways to pay' });
    const rows = more.getByTestId('payment-method');
    await expect(rows.first()).toBeVisible();
    expect(await rows.count()).toBeGreaterThan(2);
    await expect(
      page.getByText(
        'Check the account name shown in your banking app before you confirm the transfer.',
      ),
    ).toBeVisible();
  });

  test('Copy number and Copy all details use the same helpers and say so in the snackbar for 2 seconds', async ({
    page,
  }) => {
    await servePayments(page, allOn());
    await gotoSkin(page, '/payment');
    const preferred = page.getByRole('region', { name: 'Preferred methods' });
    const toast = page.getByTestId('payment-toast');
    await preferred
      .getByRole('button', { name: 'Copy number' })
      .first()
      .click();
    await expect(toast).toHaveText('BIDV account number copied');
    await expect(toast).toHaveCSS('opacity', '1');
    // it floats at the bottom of the window, not inside the panel
    const box = await toast.boundingBox();
    const height = page.viewportSize()?.height ?? 0;
    expect((box?.y ?? 0) + (box?.height ?? 0)).toBeGreaterThan(height - 140);
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      '1234567890',
    );
    await preferred
      .getByRole('button', { name: 'Copy all details' })
      .first()
      .click();
    await expect(toast).toHaveText('BIDV details copied');
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      'BIDV\nAccount name: NGUYEN VAN A\nAccount number: 1234567890',
    );
    await expect(toast).toHaveCSS('opacity', '0', { timeout: 5000 });
    const more = page.getByRole('region', { name: 'More ways to pay' });
    await more.getByRole('button', { name: 'Copy number' }).first().click();
    await expect(toast).toContainText('account number copied');
  });

  test('says it could not copy when the clipboard is refused', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: () => Promise.reject(new Error('blocked')),
        },
      });
      document.execCommand = () => false;
    });
    await servePayments(page, allOn());
    await gotoSkin(page, '/payment');
    await page.getByRole('button', { name: 'Copy number' }).first().click();
    await expect(page.getByTestId('payment-toast')).toContainText(
      'Could not copy',
    );
  });

  test('the QR thumbnail opens the QR window of Standard, which copies, steps through the methods and closes with Esc', async ({
    page,
  }) => {
    await servePayments(page, allOn());
    await gotoSkin(page, '/payment');
    await page.getByRole('button', { name: 'Enlarge BIDV QR code' }).click();
    const win = page.getByRole('dialog', { name: 'BIDV QR code' });
    await expect(win).toBeVisible();
    await expect(win.getByText(/^1 of \d+$/)).toBeVisible();
    await win.getByRole('button', { name: 'Copy number' }).click();
    await expect(page.getByTestId('payment-toast')).toContainText(
      'BIDV account number copied',
    );
    await expect(win.getByRole('button', { name: 'Save QR' })).toBeVisible();
    await win.getByRole('button', { name: 'Next method' }).click();
    await expect(
      page.getByRole('dialog', { name: 'MoMo QR code' }),
    ).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(win).toBeHidden();
  });

  test('a row with a QR code has a QR button that opens the same window', async ({
    page,
  }) => {
    await servePayments(page, allOn());
    await gotoSkin(page, '/payment');
    await page
      .getByRole('button', { name: /^Show .* QR code$/ })
      .first()
      .click();
    await expect(page.getByRole('dialog', { name: /QR code$/ })).toBeVisible();
  });

  test('filters the rows by bank or wallet, only when there are both', async ({
    page,
  }) => {
    await servePayments(page, allOn());
    await gotoSkin(page, '/payment');
    const more = page.getByRole('region', { name: 'More ways to pay' });
    const filter = page.getByRole('group', { name: 'Filter payment methods' });
    await expect(more.getByTestId('payment-method').first()).toBeVisible();
    const all = await more.getByTestId('payment-method').count();
    await filter.getByRole('button', { name: /^Wallet/ }).click();
    await expect(
      filter.getByRole('button', { name: /^Wallet/ }),
    ).toHaveAttribute('aria-pressed', 'true');
    await expect
      .poll(() => more.getByTestId('payment-method').count())
      .toBeLessThan(all);
    await expect(
      more.getByText('Wallet', { exact: true }).first(),
    ).toBeVisible();
    await expect(more.getByText('Bank', { exact: true })).toHaveCount(0);
    await filter.getByRole('button', { name: /^All/ }).click();
    await expect
      .poll(() => more.getByTestId('payment-method').count())
      .toBe(all);
  });

  test('has no filter when there is only one kind', async ({ page }) => {
    const wallets = Object.fromEntries(
      Object.entries(allOn()).filter(
        ([, d]) => (d as { kind?: string }).kind === 'wallet',
      ),
    );
    await servePayments(page, wallets);
    await gotoSkin(page, '/payment');
    await expect(
      page.getByRole('region', { name: 'Preferred methods' }),
    ).toBeVisible();
    await expect(
      page.getByRole('group', { name: 'Filter payment methods' }),
    ).toHaveCount(0);
  });

  test('says "Payment details" when every method is a row, with no recommended one', async ({
    page,
  }) => {
    const plain = Object.fromEntries(
      Object.entries(allOn()).map(([id, d]) => [id, { ...d, highlight: null }]),
    );
    await servePayments(page, plain);
    await gotoSkin(page, '/payment');
    await expect(
      page.getByRole('region', { name: 'Payment details' }),
    ).toBeVisible();
    await expect(page.getByText('Recommended')).toHaveCount(0);
  });

  test('a single method is shown as the recommended one even when it is not highlighted', async ({
    page,
  }) => {
    const [[id, bidv]] = Object.entries(allOn());
    await servePayments(page, { [id]: { ...bidv, highlight: null } });
    await gotoSkin(page, '/payment');
    await expect(
      page
        .getByRole('region', { name: 'Payment details' })
        .getByText('Recommended'),
    ).toBeVisible();
  });

  test('says payments are paused when none is on, with a way to the ticket on Services', async ({
    page,
  }) => {
    await servePayments(page, {});
    await gotoSkin(page, '/payment');
    await expect(
      page.getByRole('heading', { name: 'Payments are paused for now' }),
    ).toBeVisible();
    await page
      .getByRole('link', { name: 'Tell me about your project' })
      .click();
    await expect(page).toHaveURL(/\/services#contact-cta$/);
    await expect(page.locator('#contact-cta')).toBeInViewport();
  });

  test('says it could not load, and Try again loads the methods', async ({
    page,
  }) => {
    await page.route('**/firestore.googleapis.com/**', (route) => {
      const request = route.request();
      return request.url().includes(':runQuery') &&
        (request.postData() ?? '').includes('"collectionId":"payments"')
        ? route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: '{"error":{"code":500,"status":"INTERNAL"}}',
          })
        : route.fallback();
    });
    await gotoSkin(page, '/payment');
    const alert = page.locator('[data-state="error"]');
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
    await expect(
      page.getByRole('region', { name: 'Preferred methods' }),
    ).toBeVisible({ timeout: 15_000 });
  });

  test('speaks Vietnamese', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
    await servePayments(page, allOn());
    await gotoSkin(page, '/payment');
    await expect(
      page.getByRole('region', { name: 'Phương thức ưu tiên' }),
    ).toBeVisible();
    await expect(
      page
        .getByRole('region', { name: 'Phương thức ưu tiên' })
        .getByText('Ưu tiên', { exact: true }),
    ).toHaveCount(2);
    await page.getByRole('button', { name: 'Sao chép số' }).first().click();
    await expect(page.getByTestId('payment-toast')).toContainText(
      'Đã sao chép số tài khoản',
    );
  });

  test('has no horizontal scroll on a phone, in both lists', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await servePayments(page, allOn());
    await gotoSkin(page, '/payment');
    await expect(
      page.getByRole('region', { name: 'More ways to pay' }),
    ).toBeVisible();
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
