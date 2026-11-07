/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { readFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';
import { mockFirestore } from '../support/firestore-mock';
import { mockImages } from '../support/images';
import { servePayments } from '../support/payments';
import { gotoSkin, useSkin } from '../support/skin';
import { mockNotify, mockWorker } from '../support/worker';

test.beforeEach(async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await useSkin(page, 'stream');
  await mockFirestore(page);
  await mockImages(page);
});

const noSideScroll = async (page: Page) =>
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    ),
  ).toBeLessThanOrEqual(0);

test.describe('Certificates, the playlist page', () => {
  test('has the card of the playlist and a numbered row for every certificate', async ({
    page,
  }) => {
    await gotoSkin(page, '/certificates');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Certificates' }),
    ).toBeVisible();
    await expect(
      page.getByText('Professional certifications behind the skills'),
    ).toBeVisible();
    await expect(page.getByText('3 certificates')).toBeVisible();
    await expect(page.getByText('Latest')).toHaveCount(1);
    const rows = page.getByTestId('certificate');
    await expect(rows).toHaveCount(3);
    const first = rows.first();
    await expect(
      first.getByRole('heading', {
        name: 'Claude Certified Architect - Professional',
      }),
    ).toBeVisible();
    await expect(first).toContainText('Anthropic');
    await expect(first).toContainText('Issued Oct 31, 2026');
    await expect(
      first.getByRole('list', { name: 'Skills covered' }).getByRole('listitem'),
    ).toHaveText(['#Claude Code', '#MCP', '#AI agents']);
    await expect(first.getByRole('link', { name: 'Open PDF' })).toHaveAttribute(
      'href',
      /claude-architect\.pdf$/,
    );
    await expect(rows.nth(1)).toContainText('Google / Coursera');
  });

  test('a thumbnail opens the viewer, which steps through every certificate', async ({
    page,
  }) => {
    await gotoSkin(page, '/certificates');
    await page
      .getByRole('button', { name: /View Claude Certified Architect/ })
      .click();
    const viewer = page.getByRole('dialog');
    await expect(viewer).toContainText('Claude Certified Architect');
    await expect(viewer).toContainText('Anthropic, issued Oct 31, 2026');
    await expect(
      viewer.getByRole('link', { name: 'Open PDF' }),
    ).toHaveAttribute('href', /claude-architect\.pdf$/);
    await viewer.getByRole('button', { name: 'Next certificate' }).click();
    await expect(viewer.getByText('2 of 3')).toBeVisible();
    await viewer.getByRole('button', { name: 'Previous certificate' }).click();
    await viewer.getByRole('button', { name: 'Previous certificate' }).click();
    await expect(viewer.getByText('3 of 3')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(viewer).toHaveCount(0);
  });

  test('View all opens the viewer at the first certificate', async ({
    page,
  }) => {
    await gotoSkin(page, '/certificates');
    await page.getByRole('button', { name: 'View all' }).click();
    await expect(page.getByRole('dialog').getByText('1 of 3')).toBeVisible();
  });

  test('is in Vietnamese', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
    await gotoSkin(page, '/certificates');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Chứng chỉ' }),
    ).toBeVisible();
    await expect(page.getByText('3 chứng chỉ')).toBeVisible();
    await expect(page.getByText('Mới nhất')).toBeVisible();
    await expect(page.getByText('Cấp ngày 31/10/2026')).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Mở PDF' }).first(),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Xem tất cả' }).click();
    await expect(page.getByRole('dialog').getByText('1 / 3')).toBeVisible();
  });

  test('keeps its title when there are no certificates, and fits a phone', async ({
    page,
  }) => {
    await page.unrouteAll({ behavior: 'ignoreErrors' });
    await mockFirestore(page, {});
    await page.route('**/firestore.googleapis.com/**', (route) => {
      const body = route.request().postData() ?? '';
      return route.request().url().includes(':runQuery') &&
        body.includes('"collectionId":"certificates"')
        ? route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([{ readTime: '2026-01-01T00:00:00Z' }]),
          })
        : route.fallback();
    });
    await gotoSkin(page, '/certificates');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Certificates' }),
    ).toBeVisible();
    await expect(page.getByText('No certificates to show yet')).toBeVisible();
    await expect(page.getByRole('button', { name: 'View all' })).toHaveCount(0);
  });

  test('fits a phone', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoSkin(page, '/certificates');
    await expect(page.getByTestId('certificate')).toHaveCount(3);
    await noSideScroll(page);
  });
});

const seed = JSON.parse(readFileSync('tests/fixtures/seed.json', 'utf8')) as {
  payments: Record<string, Record<string, unknown>>;
};
/** BIDV and MoMo are the featured ones, the rest of the fixtures (banks and wallets) are "more ways". */
const allPayments = Object.fromEntries(
  Object.entries(seed.payments).map(([id, d]) => [
    id,
    {
      ...d,
      visible: true,
      highlight: id === 'bidv' || id === 'momo' ? 1 : null,
    },
  ]),
);

test.describe('Payment, the Join page', () => {
  test('shows the header, the notice, the preferred level and the other ways', async ({
    page,
  }) => {
    await gotoSkin(page, '/payment');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Payment' }),
    ).toBeVisible();
    await expect(page.getByText('Scan a QR code or copy')).toBeVisible();
    await expect(
      page.getByText('Check the account name shown in your banking app'),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Preferred methods' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'More ways to pay' }),
    ).toBeVisible();
    const methods = page.getByTestId('payment-method');
    await expect(methods).toHaveCount(2);
    const bidv = methods.first();
    await expect(bidv).toContainText('BIDV');
    await expect(bidv).toContainText('Bank');
    await expect(bidv).toContainText('Account number');
    await expect(bidv).toContainText('1234567890');
    await expect(bidv).toContainText('Account name');
    await expect(bidv).toContainText('NGUYEN VAN A');
    await expect(methods.nth(1)).toContainText('MoMo');
    await expect(methods.nth(1)).toContainText('Wallet');
  });

  test('copies the number and all the details, each with its snackbar', async ({
    page,
  }) => {
    await gotoSkin(page, '/payment');
    await page.getByRole('button', { name: 'Copy number' }).first().click();
    await expect(page.getByTestId('payment-toast')).toHaveText(
      'BIDV account number copied',
    );
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      '1234567890',
    );
    await page.getByRole('button', { name: 'Copy all details' }).click();
    await expect(page.getByTestId('payment-toast')).toHaveText(
      'BIDV details copied',
    );
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      'BIDV\nAccount name: NGUYEN VAN A\nAccount number: 1234567890',
    );
    await page.getByRole('button', { name: 'Copy number' }).last().click();
    await expect(page.getByTestId('payment-toast')).toHaveText(
      'MoMo account number copied',
    );
  });

  test('the QR code opens in the viewer, which steps to the next method and copies', async ({
    page,
  }) => {
    await gotoSkin(page, '/payment');
    await page.getByRole('button', { name: 'Enlarge BIDV QR code' }).click();
    const viewer = page.getByRole('dialog', { name: 'BIDV QR code' });
    await expect(viewer).toBeVisible();
    await expect(viewer.getByText('1 of 2')).toBeVisible();
    await expect(viewer).toContainText('1234567890');
    await expect(viewer.getByRole('button', { name: 'Save QR' })).toBeVisible();
    await viewer.getByRole('button', { name: 'Next method' }).click();
    await expect(
      page.getByRole('dialog', { name: 'MoMo QR code' }),
    ).toBeVisible();
    await page
      .getByRole('dialog')
      .getByRole('button', { name: 'Copy number' })
      .click();
    await expect(page.getByTestId('payment-toast')).toHaveText(
      'MoMo account number copied',
    );
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('the bank and wallet tabs filter the other ways', async ({ page }) => {
    await servePayments(page, allPayments);
    await gotoSkin(page, '/payment');
    const tabs = page.getByRole('group', { name: 'Filter payment methods' });
    await expect(tabs.getByRole('button')).toHaveText([
      /^All\s*8$/,
      /^Bank\s*2$/,
      /^Wallet\s*6$/,
    ]);
    await expect(tabs.getByRole('button', { name: /^All/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(page.getByTestId('payment-method')).toHaveCount(10);
    await tabs.getByRole('button', { name: /^Bank/ }).click();
    await expect(page.getByTestId('payment-method')).toHaveCount(4);
    await expect(
      page.getByRole('heading', { name: 'Vietcombank' }),
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Binance' })).toHaveCount(0);
    await tabs.getByRole('button', { name: /^Wallet/ }).click();
    await expect(page.getByTestId('payment-method')).toHaveCount(8);
    await expect(
      page.getByRole('button', { name: 'Show Binance QR code' }),
    ).toBeVisible();
  });

  test('says nothing about tabs when there is one kind, and shows one method as the only level', async ({
    page,
  }) => {
    await servePayments(page, { bidv: allPayments.bidv });
    await gotoSkin(page, '/payment');
    await expect(
      page.getByRole('heading', { name: 'Payment details' }),
    ).toBeVisible();
    await expect(page.getByTestId('payment-method')).toHaveCount(1);
    await expect(
      page.getByRole('group', { name: 'Filter payment methods' }),
    ).toHaveCount(0);
  });

  test('says payments are paused and keeps its header', async ({ page }) => {
    await servePayments(page, {});
    await gotoSkin(page, '/payment');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Payment' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Payments are paused for now' }),
    ).toBeVisible();
    await expect(page.getByText('Check the account name')).toHaveCount(0);
  });

  test('is in Vietnamese and fits a phone', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
    await page.setViewportSize({ width: 390, height: 844 });
    await servePayments(page, allPayments);
    await gotoSkin(page, '/payment');
    await expect(
      page.getByRole('heading', { name: 'Phương thức ưu tiên' }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Sao chép số' }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: /^Ngân hàng\s*2$/ }),
    ).toBeVisible();
    await noSideScroll(page);
  });
});

test.describe('Services, the Community tab', () => {
  test('lists the services as posts and has the composer with the topic chips', async ({
    page,
  }) => {
    await gotoSkin(page, '/services');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Services' }),
    ).toBeVisible();
    const posts = page
      .getByRole('list', { name: 'Services' })
      .getByRole('listitem');
    await expect(posts).toHaveCount(5);
    await expect(posts.first()).toContainText('App Development');
    await expect(posts.first()).toContainText('I build Android and iOS apps');
    await expect(posts.first().locator('.svc-art')).toBeVisible();
    await expect(
      page.getByRole('group', { name: 'Topic' }).getByRole('button'),
    ).toHaveCount(5);
    await expect(
      page.getByRole('heading', { name: 'What do you want to build?' }),
    ).toBeVisible();
    await expect(page.locator('#contact-cta')).toBeVisible();
  });

  test('a topic chip and a post action both start the message, and toggle each other', async ({
    page,
  }) => {
    await gotoSkin(page, '/services');
    const message = page.getByLabel('Message', { exact: true });
    await page
      .getByRole('group', { name: 'Topic' })
      .getByRole('button', { name: 'App Development' })
      .click();
    await expect(message).toHaveValue(
      /^Hi Bach, I'm looking for help with a mobile app/,
    );
    await expect(
      page.getByRole('button', { name: 'Ask about App Development' }),
    ).toHaveAttribute('aria-pressed', 'true');
    await page
      .getByRole('button', { name: 'Ask about Web Development' })
      .click();
    await expect(message).toHaveValue(
      /^Hi Bach, I'd like a website or web app built/,
    );
    await expect(
      page
        .getByRole('group', { name: 'Topic' })
        .getByRole('button', { name: 'Web Development' }),
    ).toHaveAttribute('aria-pressed', 'true');
    await expect(
      page.getByRole('button', { name: 'Ask about App Development' }),
    ).toHaveAttribute('aria-pressed', 'false');
  });

  test('an empty send is refused with the focus on the first problem', async ({
    page,
  }) => {
    await gotoSkin(page, '/services');
    await page.getByRole('button', { name: 'Send', exact: true }).click();
    await expect(page.getByLabel('Name')).toBeFocused();
    await expect(page.getByLabel('Name')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    await expect(page.getByText('Name is required')).toBeVisible();
    await expect(
      page.getByText('Enter a valid email so I can reply'),
    ).toBeVisible();
    await expect(page.getByText('Message is required')).toBeVisible();
  });

  test('the composer sends the contact form and the message becomes the comment', async ({
    page,
  }) => {
    await mockNotify(page);
    const writes: string[] = [];
    page.on('request', (r) => {
      if (r.url().includes(':commit')) writes.push(r.postData() ?? '');
    });
    await gotoSkin(page, '/services');
    await page.getByLabel('Name').fill('Ada Lovelace');
    await page.getByLabel('Email').fill('ada@example.com');
    await page.getByLabel('Message', { exact: true }).fill('I need an app.');
    await page.getByRole('button', { name: 'Send', exact: true }).click();
    await expect(
      page.getByRole('heading', { name: 'Message sent' }),
    ).toBeFocused();
    await expect(
      page.getByText("Thanks, Ada Lovelace. I'll reply to ada@example.com."),
    ).toBeVisible();
    await expect(page.locator('#contact-cta')).toContainText('I need an app.');
    expect(writes.join('')).toContain('I need an app.');
    await page.getByRole('button', { name: 'Send another message' }).click();
    await expect(page.getByLabel('Name')).toBeFocused();
    await expect(page.getByLabel('Message', { exact: true })).toHaveValue('');
  });

  test('says so when sending fails, keeps the text and offers Try again', async ({
    page,
  }) => {
    await gotoSkin(page, '/services?form=error');
    await page.getByLabel('Name').fill('Ada');
    await page.getByLabel('Email').fill('ada@example.com');
    await page.getByLabel('Message', { exact: true }).fill('Hello');
    await page.getByRole('button', { name: 'Send', exact: true }).click();
    await expect(
      page.getByRole('alert').filter({ hasText: "Couldn't send" }),
    ).toBeVisible();
    await expect(page.getByLabel('Message', { exact: true })).toHaveValue(
      'Hello',
    );
    await expect(page.getByRole('button', { name: 'Try again' })).toBeFocused();
  });

  test('a bot that fills the hidden field gets the sent state and nothing is written', async ({
    page,
  }) => {
    const writes: string[] = [];
    page.on('request', (r) => {
      if (r.url().includes(':commit')) writes.push(r.postData() ?? '');
    });
    await gotoSkin(page, '/services');
    await page.getByLabel('Name').fill('Bot');
    await page.getByLabel('Email').fill('bot@example.com');
    await page.getByLabel('Message', { exact: true }).fill('Buy now');
    await page.locator('input[name="website"]').fill('spam', { force: true });
    await page.getByRole('button', { name: 'Send', exact: true }).click();
    await expect(
      page.getByRole('heading', { name: 'Message sent' }),
    ).toBeVisible();
    expect(writes).toEqual([]);
  });

  test('the contact form switch shows the note instead of the form, and the chat switch takes Ask BB Bot away', async ({
    page,
  }) => {
    await page.unrouteAll({ behavior: 'ignoreErrors' });
    await mockFirestore(page, {
      'site/live': { features: { contactForm: false, chat: false } },
    });
    await gotoSkin(page, '/services');
    await expect(
      page.getByText('The contact form is taking a break.'),
    ).toBeVisible();
    await expect(page.getByLabel('Name')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Ask BB Bot' })).toHaveCount(
      0,
    );
  });

  test('Ask BB Bot in the composer opens the chat', async ({ page }) => {
    await mockWorker(page, () => ({ body: { text: 'Hello from the bot.' } }));
    await gotoSkin(page, '/services');
    await page
      .locator('#contact-cta')
      .getByRole('button', { name: 'Ask BB Bot' })
      .click();
    await expect(
      page.getByRole('dialog', { name: 'BB Bot, AI assistant' }),
    ).toBeVisible();
  });

  test('the composer comes after the posts on a phone, and nothing scrolls sideways', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoSkin(page, '/services');
    const last = await page
      .getByRole('list', { name: 'Services' })
      .getByRole('listitem')
      .last()
      .boundingBox();
    const composer = await page.locator('#contact-cta').boundingBox();
    expect(composer!.y).toBeGreaterThan(last!.y);
    await noSideScroll(page);
  });

  test('is in Vietnamese', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
    await gotoSkin(page, '/services');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Dịch vụ' }),
    ).toBeVisible();
    await expect(page.getByText('Hỏi về mục này').first()).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Hỏi về Phát triển ứng dụng' }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Gửi', exact: true }).click();
    await expect(page.getByText('Vui lòng nhập tên')).toBeVisible();
  });
});
