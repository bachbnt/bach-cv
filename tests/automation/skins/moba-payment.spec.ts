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
  await useSkin(page, 'moba');
  await mockFirestore(page);
  await mockImages(page);
});

const methods = (page: Page) => page.getByTestId('payment-method');
const chests = (page: Page) =>
  page.locator('article[data-testid="payment-method"]');
const purses = (page: Page) => page.locator('li[data-testid="payment-method"]');
const toast = (page: Page, text: RegExp) =>
  page.getByRole('status').filter({ hasText: text });
const clipboard = (page: Page) =>
  page.evaluate(() => navigator.clipboard.readText());

test.describe('the vault', () => {
  test('shows the title, the intro and the note', async ({ page }) => {
    await servePayments(page, allOn());
    await gotoSkin(page, '/payment');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Payment' }),
    ).toBeVisible();
    await expect(
      page.getByText('Scan a QR code or copy an account number'),
    ).toBeVisible();
    await expect(
      page.getByText(/Check the account name shown in your banking app/),
    ).toBeVisible();
  });

  test('a highlighted method comes first and the others follow; hidden ones never show', async ({
    page,
  }) => {
    const on = allOn();
    await servePayments(page, {
      bidv: { ...on.bidv, highlight: 1 },
      momo: { ...on.momo, highlight: null },
    });
    await gotoSkin(page, '/payment');
    await expect(
      page.getByRole('heading', { level: 2, name: 'Preferred methods' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 2, name: 'More ways to pay' }),
    ).toBeVisible();
    await expect(methods(page)).toHaveCount(2);
    await expect(methods(page).first()).toContainText('BIDV');
    await expect(methods(page).first()).toContainText('1234567890');
    await expect(methods(page).nth(1)).toContainText('MoMo');
    await expect(page.getByText('Vietcombank')).toHaveCount(0);
  });

  test('with exactly one visible method it is shown as Payment details', async ({
    page,
  }) => {
    await servePayments(page, { bidv: allOn().bidv });
    await gotoSkin(page, '/payment');
    await expect(
      page.getByRole('heading', { level: 2, name: 'Payment details' }),
    ).toBeVisible();
    await expect(methods(page)).toHaveCount(1);
    await expect(methods(page)).toContainText('BIDV');
  });

  test('each method shows its kind, holder, number and logo or initials', async ({
    page,
  }) => {
    await servePayments(page, allOn());
    await gotoSkin(page, '/payment');
    const bidv = chests(page).first();
    await expect(bidv).toContainText('Bank');
    await expect(bidv.getByText('Account name', { exact: true })).toBeVisible();
    await expect(bidv).toContainText('NGUYEN VAN A');
    await expect(
      bidv.getByText('Account number', { exact: true }),
    ).toBeVisible();
    await expect(bidv.locator('img[src*="icon-bidv"]')).toBeAttached();
    // a method without a logo gets its initials (derive/initials: ShopeePay -> SP)
    const shopee = purses(page).filter({ hasText: 'ShopeePay' });
    await expect(shopee).toContainText('SP');
    await expect(shopee).toContainText('Wallet');
  });

  test('a method with no account name shows the number only', async ({
    page,
  }) => {
    const on = allOn();
    await servePayments(page, { bidv: { ...on.bidv, holder: '' } });
    await gotoSkin(page, '/payment');
    await expect(methods(page)).toContainText('1234567890');
    await expect(page.getByText('Account name', { exact: true })).toHaveCount(
      0,
    );
  });

  test('highlighted methods come first, then More ways to pay with a filter that counts', async ({
    page,
  }) => {
    await servePayments(page, allOn());
    await gotoSkin(page, '/payment');
    await expect(chests(page)).toHaveCount(2);
    await expect(chests(page).first()).toContainText('BIDV');
    await expect(chests(page).nth(1)).toContainText('MoMo');
    await expect(purses(page)).toHaveCount(8);
    const filter = page.getByRole('group', { name: 'Filter payment methods' });
    await filter.getByRole('button', { name: /^Bank/ }).click();
    await expect(filter.getByRole('button', { name: /^Bank/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(purses(page)).toHaveCount(2);
    await filter.getByRole('button', { name: /^Wallet/ }).click();
    await expect(purses(page)).toHaveCount(6);
    await filter.getByRole('button', { name: /^All/ }).click();
    await expect(purses(page)).toHaveCount(8);
    await expect(filter.getByRole('button', { name: /^All/ })).toContainText(
      '8',
    );
    await expect(filter.getByRole('button', { name: /^Bank/ })).toContainText(
      '2',
    );
    await expect(filter.getByRole('button', { name: /^Wallet/ })).toContainText(
      '6',
    );
  });

  test('copy buttons write to the clipboard and say so with the Standard words', async ({
    page,
  }) => {
    await servePayments(page, allOn());
    await gotoSkin(page, '/payment');
    const bidv = chests(page).first();
    await bidv.getByRole('button', { name: 'Copy number' }).click();
    await expect(toast(page, /copied/)).toHaveText(
      'BIDV account number copied',
    );
    expect(await clipboard(page)).toBe('1234567890');
    await bidv.getByRole('button', { name: 'Copy all details' }).click();
    await expect(toast(page, /copied/)).toHaveText('BIDV details copied');
    expect(await clipboard(page)).toBe(
      'BIDV\nAccount name: NGUYEN VAN A\nAccount number: 1234567890',
    );
    await purses(page)
      .first()
      .getByRole('button', { name: 'Copy number' })
      .click();
    await expect(toast(page, /copied/)).toContainText('account number copied');
    expect(await clipboard(page)).toBe('0000000005');
  });

  test('the toast says so when the clipboard is refused', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: () => Promise.reject(new Error('no')) },
      });
      document.execCommand = () => false;
    });
    await servePayments(page, allOn());
    await gotoSkin(page, '/payment');
    await chests(page)
      .first()
      .getByRole('button', { name: 'Copy number' })
      .click();
    await expect(toast(page, /Could not copy/)).toHaveText(
      'Could not copy. Select the number and press Ctrl or Cmd + C.',
    );
  });

  test('the QR viewer shows the QR on white with the account, copies, saves, steps through methods and returns focus', async ({
    page,
  }) => {
    await servePayments(page, allOn());
    await gotoSkin(page, '/payment');
    const opener = page.getByRole('button', { name: 'Enlarge BIDV QR code' });
    await opener.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toContainText('BIDV QR code');
    await expect(
      dialog.getByRole('img', { name: 'BIDV payment QR code' }),
    ).toBeVisible();
    await expect(
      dialog.getByRole('img', { name: 'BIDV payment QR code' }),
    ).toHaveClass(/bg-white/);
    await expect(dialog).toContainText('Account name: NGUYEN VAN A');
    await expect(dialog).toContainText('Account number: 1234567890');
    await expect(
      dialog.getByRole('button', { name: 'Close QR code' }),
    ).toBeVisible();
    await dialog.getByRole('button', { name: 'Copy number' }).click();
    await expect(toast(page, /copied/)).toHaveText(
      'BIDV account number copied',
    );
    expect(await clipboard(page)).toBe('1234567890');

    const saved = page.waitForEvent('download').catch(() => null);
    const popup = page.waitForEvent('popup').catch(() => null);
    await dialog.getByRole('button', { name: 'Save QR' }).click();
    await expect(toast(page, /QR/)).toContainText(
      /QR code saved|Opened the QR image/,
    );
    void saved;
    void popup;

    await expect(
      dialog.getByRole('button', { name: 'Previous method' }),
    ).toBeVisible();
    await page.keyboard.press('ArrowRight');
    await expect(dialog).toContainText('MoMo QR code');
    await page.keyboard.press('ArrowLeft');
    await expect(dialog).toContainText('BIDV QR code');
    await dialog.getByRole('button', { name: 'Next method' }).click();
    await expect(dialog).toContainText('MoMo QR code');
    await dialog.getByRole('button', { name: 'Previous method' }).click();
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(opener).toBeFocused();
  });

  test('the viewer steps across every method that has a QR code, in the order of the page', async ({
    page,
  }) => {
    const on = allOn();
    await servePayments(page, {
      bidv: on.bidv,
      momo: { ...on.momo, qr: '' },
      vnpay: on.vnpay,
    });
    await gotoSkin(page, '/payment');
    await page.getByRole('button', { name: 'Enlarge BIDV QR code' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('button', { name: 'Next method' }).click();
    // MoMo has no QR code, so after BIDV comes VNPay
    await expect(dialog).toContainText('VNPay QR code');
    await expect(
      page.getByRole('button', { name: 'Show MoMo QR code' }),
    ).toHaveCount(0);
  });

  test('every row with a QR code has a button for it that opens that method', async ({
    page,
  }) => {
    await servePayments(page, allOn());
    await gotoSkin(page, '/payment');
    await expect(
      page.getByRole('button', { name: /^Show .* QR code$/ }),
    ).toHaveCount(8);
    const open = page.getByRole('button', { name: 'Show ZaloPay QR code' });
    await open.click();
    await expect(page.getByRole('dialog')).toContainText('ZaloPay QR code');
    await page.keyboard.press('Escape');
    await expect(open).toBeFocused();
  });

  test('everything can be reached with the keyboard: Enter on the QR opens the viewer, Escape closes it', async ({
    page,
  }) => {
    await servePayments(page, { bidv: allOn().bidv });
    await gotoSkin(page, '/payment');
    const qr = page.getByRole('button', { name: 'Enlarge BIDV QR code' });
    await qr.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(qr).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(
      page.getByRole('button', { name: 'Copy number' }),
    ).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(
      page.getByRole('button', { name: 'Copy all details' }),
    ).toBeFocused();
  });
});

test.describe('states', () => {
  test('with no method it says payments are paused and points to the contact form', async ({
    page,
  }) => {
    await servePayments(page, {});
    await gotoSkin(page, '/payment');
    await expect(
      page.getByRole('heading', { name: 'Payments are paused for now' }),
    ).toBeVisible();
    await expect(methods(page)).toHaveCount(0);
    await expect(page.getByText(/Check the account name/)).toHaveCount(0);
    await expect(
      page.getByRole('link', { name: 'Tell me about your project' }),
    ).toHaveAttribute('href', '/services#contact-cta');
  });

  test('shows a loading screen while the methods are on their way', async ({
    page,
  }) => {
    await servePayments(page, allOn());
    await page.route('**/firestore.googleapis.com/**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      return route.fallback();
    });
    await gotoSkin(page, '/payment');
    const loading = page.getByRole('status', { name: 'Loading' }).first();
    await expect(loading).toBeVisible();
    await expect(loading).toHaveAttribute('aria-busy', 'true');
    await expect(methods(page).first()).toBeVisible({ timeout: 15_000 });
  });

  test('says the details could not load and Try again brings them back', async ({
    page,
  }) => {
    await servePayments(page, allOn());
    let fail = true;
    await page.route('**/firestore.googleapis.com/**', (route) => {
      const request = route.request();
      const mine =
        fail &&
        request.url().includes(':runQuery') &&
        (request.postData() ?? '').includes('"collectionId":"payments"');
      if (!mine) return route.fallback();
      return route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: '{"error":{"code":500,"status":"INTERNAL"}}',
      });
    });
    await gotoSkin(page, '/payment');
    await expect(
      page.getByRole('heading', {
        name: "The payment details couldn't be loaded",
      }),
    ).toBeVisible();
    fail = false;
    await page.getByRole('button', { name: 'Try again' }).click();
    await expect(methods(page).first()).toBeVisible();
  });

  test('soon shows the locked screen and hidden the not found screen', async ({
    page,
  }) => {
    await servePayments(page, allOn());
    await mockFirestore(page, { 'site/live': { pages: { payment: 'soon' } } });
    await gotoSkin(page, '/payment');
    await expect(page.getByText('This page is coming soon.')).toBeVisible();
    await expect(methods(page)).toHaveCount(0);
  });

  test('hidden shows the not found screen', async ({ page }) => {
    await servePayments(page, allOn());
    await mockFirestore(page, {
      'site/live': { pages: { payment: 'hidden' } },
    });
    await gotoSkin(page, '/payment');
    await expect(page.getByText("This page doesn't exist.")).toBeVisible();
  });
});

test.describe('on a phone', () => {
  test.use({
    viewport: { width: 360, height: 800 },
    hasTouch: true,
    isMobile: true,
  });

  test('nothing scrolls sideways and the buttons are big enough', async ({
    page,
  }) => {
    const on = allOn();
    await servePayments(page, {
      ...on,
      bidv: {
        ...on.bidv,
        holder: 'NGUYEN VAN A '.repeat(6).trim(),
        account: '1234567890123456789012345678901234567890',
      },
    });
    await gotoSkin(page, '/payment');
    await expect(methods(page).first()).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    const wide = await page.evaluate(
      () =>
        [
          ...document.querySelectorAll<HTMLElement>(
            '[data-testid="payment-method"], [data-testid="payment-method"] *',
          ),
        ].filter((e) => e.getBoundingClientRect().right > window.innerWidth + 1)
          .length,
    );
    expect(wide).toBe(0);
    const copy = purses(page)
      .first()
      .getByRole('button', { name: 'Copy number' });
    await copy.scrollIntoViewIfNeeded();
    expect((await copy.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(44);
  });
});

test.describe('in Vietnamese', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
  });

  test('the labels, the toast and the viewer are translated', async ({
    page,
  }) => {
    await servePayments(page, {
      bidv: allOn().bidv,
      momo: { ...allOn().momo, highlight: null },
    });
    await gotoSkin(page, '/payment');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Thanh toán' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 2, name: 'Phương thức ưu tiên' }),
    ).toBeVisible();
    await expect(
      page.getByText('Tên tài khoản', { exact: true }).first(),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Sao chép số' }).first().click();
    await expect(toast(page, /Đã sao chép/)).toHaveText(
      'Đã sao chép số tài khoản BIDV',
    );
    await page.getByRole('button', { name: 'Phóng to mã QR BIDV' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toContainText('Mã QR BIDV');
    await expect(
      dialog.getByRole('button', { name: 'Lưu mã QR' }),
    ).toBeVisible();
    await expect(
      dialog.getByRole('button', { name: 'Phương thức tiếp theo' }),
    ).toBeVisible();
    await expect(
      dialog.getByRole('button', { name: 'Đóng mã QR' }),
    ).toBeVisible();
  });

  test('the paused state is translated', async ({ page }) => {
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
