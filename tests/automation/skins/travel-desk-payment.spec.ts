/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test, type Page } from '@playwright/test';
import { mockFirestore } from '../support/firestore-mock';
import { mockImages } from '../support/images';
import { allOn, servePayments } from '../support/payments';
import { gotoSkin, useSkin } from '../support/skin';

const SLOW = { timeout: 30_000 };

test.beforeEach(async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await useSkin(page, 'travel');
  await mockFirestore(page);
  await mockImages(page);
});

const noHorizontalScroll = (page: Page) =>
  page.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth,
  );

test.describe('Payment as the ticket counter', () => {
  test('puts the highlighted methods first as tickets of numbered windows, with a QR code and the stub, and the others as smaller tickets', async ({
    page,
  }) => {
    await servePayments(page, allOn());
    await gotoSkin(page, '/payment');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Payment');
    await expect(page.getByText('Ticket counter')).toBeVisible();
    const preferred = page.getByRole('region', { name: 'Preferred methods' });
    const tickets = preferred.getByTestId('payment-method');
    await expect(tickets).toHaveCount(2);
    await expect(tickets.first()).toContainText('Window 1');
    await expect(tickets.first()).toContainText('Bank');
    await expect(tickets.first()).toContainText('BIDV');
    await expect(tickets.nth(1)).toContainText('Window 2');
    await expect(tickets.nth(1)).toContainText('Wallet');
    await expect(
      preferred.getByRole('button', { name: 'Enlarge BIDV QR code' }),
    ).toBeVisible();
    await expect(
      preferred.getByRole('img', { name: 'BIDV payment QR code' }),
    ).toBeVisible();
    await expect(preferred.getByText('Account name').first()).toBeVisible();
    await expect(preferred.getByText('NGUYEN VAN A').first()).toBeVisible();
    await expect(preferred.getByText('1234567890')).toBeVisible();
    await expect(
      preferred.getByRole('button', { name: 'Copy all details' }),
    ).toHaveCount(2);
    const more = page.getByRole('region', { name: 'More ways to pay' });
    const rows = more.getByTestId('payment-method');
    await expect(rows.first()).toBeVisible();
    expect(await rows.count()).toBeGreaterThan(2);
    await expect(
      page.getByText(
        'Check the account name shown in your banking app before you confirm the transfer.',
      ),
    ).toBeVisible();
    await expect(page.getByText('Sample numbers')).toHaveCount(0);
  });

  test('a row shows the kind, the account name and number, Copy number and the QR button of a method that has one', async ({
    page,
  }) => {
    await servePayments(page, allOn());
    await gotoSkin(page, '/payment');
    const row = page
      .getByRole('region', { name: 'More ways to pay' })
      .getByTestId('payment-method')
      .first();
    await expect(row.getByRole('heading', { level: 3 })).toBeVisible();
    await expect(row.getByText(/^(Bank|Wallet)$/)).toBeVisible();
    await expect(row.getByText('Account number')).toBeVisible();
    await expect(
      row.getByRole('button', { name: 'Copy number' }),
    ).toBeVisible();
    await expect(
      row.getByRole('button', { name: /^Show .* QR code$/ }),
    ).toBeVisible();
  });

  test('Copy number and Copy all details use the Standard helpers and say so in the toast for 2 seconds', async ({
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
    const box = (await toast.boundingBox())!;
    const height = page.viewportSize()?.height ?? 0;
    expect(box.y + box.height).toBeGreaterThan(height - 140);
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
        value: { writeText: () => Promise.reject(new Error('blocked')) },
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

  test('the QR code of a ticket opens the QR window, the QR button of a row opens the same window', async ({
    page,
  }) => {
    await servePayments(page, allOn());
    await gotoSkin(page, '/payment');
    await page.getByRole('button', { name: 'Enlarge BIDV QR code' }).click();
    await expect(
      page.getByRole('dialog', { name: 'BIDV QR code' }),
    ).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await page
      .getByRole('button', { name: /^Show .* QR code$/ })
      .first()
      .click();
    await expect(page.getByRole('dialog', { name: /QR code$/ })).toBeVisible();
  });

  test('the toast shows above the QR window', async ({ page }) => {
    await servePayments(page, allOn());
    await gotoSkin(page, '/payment');
    await page.getByRole('button', { name: 'Enlarge BIDV QR code' }).click();
    const win = page.getByRole('dialog', { name: 'BIDV QR code' });
    await win.getByRole('button', { name: 'Copy number' }).click();
    const toast = page.getByTestId('payment-toast');
    await expect(toast).toContainText('BIDV account number copied');
    // it is drawn in the body above the window (z-index 70 over 50), so the window does not cover it
    await expect(toast).toHaveCSS('z-index', '70');
    await expect(win).toHaveCSS('z-index', '50');
    expect(
      await toast.evaluate((el) => el.parentElement === document.body),
    ).toBe(true);
  });

  test('filters the tickets by bank or wallet, only when there are both', async ({
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

  test('says "Payment details" when every method is a row, with no highlighted one', async ({
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
    await expect(page.getByText('Window 1')).toHaveCount(0);
  });

  test('a single method is shown as the ticket of window 1 even when it is not highlighted', async ({
    page,
  }) => {
    const [[id, bidv]] = Object.entries(allOn());
    await servePayments(page, { [id]: { ...bidv, highlight: null } });
    await gotoSkin(page, '/payment');
    await expect(
      page
        .getByRole('region', { name: 'Payment details' })
        .getByText('Window 1'),
    ).toBeVisible();
  });

  test('a method with no logo gets its initials, and one with no QR has no QR button', async ({
    page,
  }) => {
    const on = allOn();
    await servePayments(page, {
      bidv: { ...on.bidv, highlight: 1 },
      momo: { ...on.momo, highlight: null, logo: '', qr: '' },
    });
    await gotoSkin(page, '/payment');
    const row = page
      .getByRole('region', { name: 'More ways to pay' })
      .getByTestId('payment-method');
    await expect(row.getByText('MM', { exact: true })).toBeVisible();
    await expect(row.getByRole('button', { name: /QR code/ })).toHaveCount(0);
    await expect(
      row.getByRole('button', { name: 'Copy number' }),
    ).toBeVisible();
  });

  test('says payments are paused when none is on, with a way to the contact form on Services', async ({
    page,
  }) => {
    await servePayments(page, {});
    await gotoSkin(page, '/payment');
    await expect(
      page.getByRole('heading', { name: 'Payments are paused for now' }),
    ).toBeVisible();
    await expect(page.getByTestId('payment-method')).toHaveCount(0);
    await page
      .getByRole('link', { name: 'Tell me about your project' })
      .click();
    await expect(page).toHaveURL(/\/services#contact-cta$/);
  });

  test('shows a skeleton while loading, then says it could not load, and Try again loads the methods', async ({
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
    const alert = page.getByRole('alert');
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

  test('announces the loading while the methods are read', async ({ page }) => {
    await servePayments(page, allOn());
    // the route added last runs first: it holds the request, then hands it to `servePayments`
    await page.route('**/firestore.googleapis.com/**', async (route) => {
      const request = route.request();
      if (
        request.url().includes(':runQuery') &&
        (request.postData() ?? '').includes('"collectionId":"payments"')
      )
        await new Promise((resolve) => setTimeout(resolve, 3000));
      return route.fallback();
    });
    await gotoSkin(page, '/payment');
    await expect(page.getByRole('status', { name: 'Loading' })).toBeVisible();
    await expect(
      page.getByRole('region', { name: 'Preferred methods' }),
    ).toBeVisible({ timeout: 15_000 });
  });

  test('is a card at the right of the map, away from the map controls', async ({
    page,
  }) => {
    await servePayments(page, allOn());
    await gotoSkin(page, '/payment');
    const panel = page.getByRole('region', { name: 'Payment', exact: true });
    await expect(panel).toBeVisible();
    const card = (await panel.boundingBox())!;
    const controls = (await page.locator('.tl-controls').boundingBox())!;
    expect(card.x + card.width).toBeLessThanOrEqual(controls.x);
  });

  test('the tab is named Payment and the page is a tab of the rail marked as current', async ({
    page,
  }) => {
    await servePayments(page, allOn());
    await gotoSkin(page, '/payment');
    await expect(
      page
        .getByRole('navigation', { name: 'Pages of the trip' })
        .getByRole('link', { name: 'Payment' }),
    ).toHaveAttribute('aria-current', 'page');
    await expect(page).toHaveTitle(/Payment/);
  });

  test('can be used with the keyboard alone: Tab reaches Copy number and Enter copies', async ({
    page,
  }) => {
    await servePayments(page, allOn());
    await gotoSkin(page, '/payment');
    const first = page
      .getByRole('region', { name: 'Preferred methods' })
      .getByRole('button', { name: 'Copy number' })
      .first();
    await first.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('payment-toast')).toContainText(
      'BIDV account number copied',
    );
  });

  test('speaks Vietnamese', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
    await servePayments(page, allOn());
    await gotoSkin(page, '/payment');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Thanh toán',
    );
    const preferred = page.getByRole('region', { name: 'Phương thức ưu tiên' });
    await expect(preferred).toBeVisible();
    await expect(preferred.getByText('Quầy 1')).toBeVisible();
    await expect(page.getByText('Quầy vé')).toBeVisible();
    await page.getByRole('button', { name: 'Sao chép số' }).first().click();
    await expect(page.getByTestId('payment-toast')).toContainText(
      'Đã sao chép số tài khoản',
    );
  });

  test('speaks Vietnamese when paused', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
    await servePayments(page, {});
    await gotoSkin(page, '/payment');
    await expect(
      page.getByRole('heading', { name: 'Hiện tạm dừng nhận thanh toán' }),
    ).toBeVisible(SLOW);
    await expect(page.getByText('Quầy đã đóng')).toBeVisible();
  });

  for (const [width, height] of [
    [1440, 900],
    [800, 700],
    [390, 844],
    [360, 740],
  ] as const)
    test(`has no horizontal scroll and nothing wider than its card at ${width} px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height });
      await servePayments(page, allOn());
      await gotoSkin(page, '/payment');
      if (width < 768)
        await page
          .getByRole('button', { name: 'Show the whole panel' })
          .click();
      await expect(
        page.getByRole('region', { name: 'Preferred methods' }),
      ).toBeVisible();
      expect(await noHorizontalScroll(page)).toBe(true);
      const wider = await page.getByTestId('payment-method').evaluateAll(
        (els) =>
          els.filter((el) => {
            const scroller = el.closest('.tl-scroll');
            return scroller
              ? el.scrollWidth > scroller.clientWidth + 1 ||
                  el.getBoundingClientRect().right >
                    scroller.getBoundingClientRect().right + 1
              : false;
          }).length,
      );
      expect(wider).toBe(0);
    });

  test('the buttons of a ticket are at least 44 px high on a touch screen', async ({
    browser,
  }) => {
    const context = await browser.newContext({
      hasTouch: true,
      isMobile: true,
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();
    await useSkin(page, 'travel');
    await mockFirestore(page);
    await mockImages(page);
    await servePayments(page, allOn());
    await gotoSkin(page, '/payment');
    await page.getByRole('button', { name: 'Show the whole panel' }).click();
    const buttons = page
      .getByRole('region', { name: 'Preferred methods' })
      .getByRole('button', { name: 'Copy number' });
    await expect(buttons.first()).toBeVisible();
    const box = (await buttons.first().boundingBox())!;
    expect(box.height).toBeGreaterThanOrEqual(44);
    const filter = page
      .getByRole('group', { name: 'Filter payment methods' })
      .getByRole('button')
      .first();
    await filter.scrollIntoViewIfNeeded();
    expect((await filter.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    await context.close();
  });
});
