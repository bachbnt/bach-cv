/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test } from '@playwright/test';
import { mockFirestore } from '../support/firestore-mock';
import { allOn, servePayments } from '../support/payments';
import { gotoSkin, useSkin } from '../support/skin';

test.beforeEach(async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await useSkin(page, 'dev');
  await mockFirestore(page);
});

test.describe('Projects', () => {
  test('lists the featured projects by rank, then all projects', async ({
    page,
  }) => {
    await gotoSkin(page, '/projects');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Projects',
    );
    await expect(
      page.getByRole('heading', { name: 'Featured projects' }),
    ).toBeVisible();
    await expect
      .poll(async () =>
        (await page.getByRole('heading', { level: 3 }).allTextContents()).slice(
          0,
          3,
        ),
      )
      .toEqual(['VenusAI', 'Yoga Lasyn', 'DevPad']);
    const featured = page.locator('article').filter({
      has: page.getByRole('button', { name: /screenshots$/ }),
    });
    await expect(featured.first().getByText('Freelance')).toBeVisible();
    await expect(
      featured.first().getByText('Flutter', { exact: true }),
    ).toBeVisible();
    await expect(
      featured.first().getByRole('link', { name: 'App Store' }),
    ).toHaveAttribute('href', /apps\.apple\.com/);
    await expect(
      page.getByRole('heading', { name: 'All projects' }),
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'DevPad' })).toHaveCount(2);
    // no git clone buttons and no counts in the chips: Standard has neither
    await expect(page.getByText(/git clone/)).toHaveCount(0);
  });

  test('a project without a cover gets an initials tile', async ({ page }) => {
    await mockFirestore(page, {}, (collection, id, doc) =>
      collection === 'projects' && id === 'finhub'
        ? { ...doc, cover: '' }
        : doc,
    );
    await gotoSkin(page, '/projects');
    await expect(page.getByText('FM', { exact: true })).toBeVisible();
    await expect(page.getByText('DP', { exact: true })).toHaveCount(0);
  });

  test('the kind chips filter the grid', async ({ page }) => {
    await gotoSkin(page, '/projects');
    const group = page.getByRole('group', { name: 'Filter projects' });
    await expect(
      group.getByRole('button', { name: 'All', exact: true }),
    ).toHaveAttribute('aria-pressed', 'true');
    await expect(
      group.getByRole('button', { name: 'All', exact: true }),
    ).toHaveText('All');
    await group.getByRole('button', { name: 'Freelance' }).click();
    await expect(page.getByRole('heading', { name: 'FinHub MCP' })).toHaveCount(
      0,
    );
    await expect(
      page.getByRole('heading', { name: 'Beli Coffee' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Com Chay Rop' }),
    ).toBeVisible();
    await group.getByRole('button', { name: 'Personal' }).click();
    await expect(
      page.getByRole('heading', { name: 'FinHub MCP' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Beli Coffee' }),
    ).toHaveCount(0);
  });

  test('a project that is not featured still has its screenshots button', async ({
    page,
  }) => {
    await mockFirestore(page, {}, (collection, _id, doc) =>
      collection === 'projects' ? { ...doc, highlight: null } : doc,
    );
    await gotoSkin(page, '/projects');
    await expect(
      page.getByRole('heading', { name: 'Featured projects' }),
    ).toHaveCount(0);
    const card = page.locator('article').filter({
      has: page.getByRole('heading', { name: 'DevCmd' }),
    });
    await expect(card.getByText('Featured', { exact: true })).toHaveCount(0);
    await expect(
      card.getByRole('button', { name: '7 screenshots' }),
    ).toBeVisible();
    const beli = page.locator('article').filter({
      has: page.getByRole('heading', { name: 'Beli Coffee' }),
    });
    await expect(beli.getByRole('button', { name: /screenshot/ })).toHaveCount(
      0,
    );
  });

  test('a featured project is marked Featured in the grid', async ({
    page,
  }) => {
    await gotoSkin(page, '/projects');
    await expect(page.getByText('Featured', { exact: true })).not.toHaveCount(
      0,
    );
  });

  test('the screenshots viewer steps and closes with Escape', async ({
    page,
  }) => {
    await gotoSkin(page, '/projects');
    const opener = page.getByRole('button', { name: '6 screenshots' }).first();
    await opener.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('1 of 6', { exact: true })).toBeVisible();
    await page.keyboard.press('ArrowRight');
    await expect(dialog.getByText('2 of 6', { exact: true })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(opener).toBeFocused();
  });

  test('a page with no visible project shows the empty state', async ({
    page,
  }) => {
    await page.route('**/firestore.googleapis.com/**', async (route) => {
      const body = route.request().postDataJSON?.() ?? {};
      if (
        route.request().url().includes(':runQuery') &&
        body.structuredQuery?.from?.[0]?.collectionId === 'projects'
      )
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([{ readTime: '2026-11-04T00:00:00.000000Z' }]),
        });
      return route.fallback();
    });
    await gotoSkin(page, '/projects');
    await expect(
      page.getByRole('heading', { name: 'No projects to show yet' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'All projects' }),
    ).toHaveCount(0);
  });

  test('on a phone there is no horizontal scroll', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoSkin(page, '/projects');
    await expect(
      page.getByRole('heading', { name: 'Featured projects' }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  });

  test('in Vietnamese the page and the chips are translated', async ({
    page,
  }) => {
    await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
    await gotoSkin(page, '/projects');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Dự án');
    await expect(
      page.getByRole('heading', { name: 'Dự án nổi bật' }),
    ).toBeVisible();
    const group = page.getByRole('group', { name: 'Lọc dự án' });
    await expect(group.getByRole('button', { name: 'Cá nhân' })).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Xem website' }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: /ảnh chụp màn hình$/ }).first(),
    ).toBeVisible();
  });
});

test.describe('Payment', () => {
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
    await gotoSkin(page, '/payment');
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
    await gotoSkin(page, '/payment');
    const featured = page.locator('article[data-testid="payment-method"]');
    await expect(featured).toHaveCount(2);
    await expect(featured.first()).toContainText('BIDV');
    await expect(featured.nth(1)).toContainText('MoMo');
    const rows = page.locator('li[data-testid="payment-method"]');
    await expect(rows).toHaveCount(8);

    const filter = page.getByRole('group', { name: 'Filter payment methods' });
    await filter.getByRole('button', { name: 'Bank' }).click();
    await expect(rows).toHaveCount(2);
    await filter.getByRole('button', { name: 'Wallet' }).click();
    await expect(rows).toHaveCount(6);
    // no counts in the chip labels
    await expect(
      filter.getByRole('button', { name: 'All', exact: true }),
    ).toHaveText('All');
    await filter.getByRole('button', { name: 'All', exact: true }).click();
    await expect(rows).toHaveCount(8);
  });

  test('copy buttons write to the clipboard and show a toast', async ({
    page,
  }) => {
    await servePayments(page, allOn());
    await gotoSkin(page, '/payment');

    const bidv = page.locator('article[data-testid="payment-method"]').first();
    await bidv.getByRole('button', { name: 'Copy number' }).click();
    await expect(
      page.getByRole('status').filter({ hasText: /copied/ }),
    ).toHaveText('BIDV account number copied');
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      '1234567890',
    );

    await bidv.getByRole('button', { name: 'Copy all details' }).click();
    await expect(
      page.getByRole('status').filter({ hasText: /copied/ }),
    ).toHaveText('BIDV details copied');
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      'BIDV\nAccount name: NGUYEN VAN A\nAccount number: 1234567890',
    );

    const row = page.locator('li[data-testid="payment-method"]').first();
    await row.getByRole('button', { name: 'Copy number' }).click();
    await expect(
      page.getByRole('status').filter({ hasText: /copied/ }),
    ).toContainText('copied');
  });

  test('the QR viewer zooms, copies, steps through methods and returns focus', async ({
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

  test('every row with a QR code has a button for it', async ({ page }) => {
    await servePayments(page, allOn());
    await gotoSkin(page, '/payment');
    await expect(
      page.getByRole('button', { name: /^Show .* QR code$/ }).first(),
    ).toBeVisible();
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

  test('in Vietnamese the labels and the toast are translated', async ({
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
