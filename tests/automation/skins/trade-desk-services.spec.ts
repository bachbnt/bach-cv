/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test, type Page } from '@playwright/test';
import { mockFirestore } from '../support/firestore-mock';
import { mockImages } from '../support/images';
import { gotoSkin, useSkin } from '../support/skin';
import { mockNotify, mockWorker } from '../support/worker';

test.beforeEach(async ({ page }) => {
  await useSkin(page, 'trade');
  await mockFirestore(page);
  await mockImages(page);
});

const ticket = (page: Page) => page.locator('#contact-cta');
const send = (page: Page) =>
  ticket(page).getByRole('button', { name: 'Send', exact: true });

async function fillValid(page: Page) {
  await page.getByLabel('Name').fill('Ada Lovelace');
  await page.getByLabel('Email').fill('ada@example.com');
  await page
    .getByLabel('Message', { exact: true })
    .fill('Hello there, I need an app.');
}

test.describe('Services as a broker catalogue', () => {
  test('lists every service as a row with its drawing, name, description and a Trade action', async ({
    page,
  }) => {
    await gotoSkin(page, '/services');
    const catalogue = page.getByRole('region', { name: 'Services' });
    await expect(
      catalogue.getByRole('heading', { name: 'App Development', level: 3 }),
    ).toBeVisible();
    await expect(catalogue.getByRole('listitem')).toHaveCount(5);
    // the drawings are the skin's own, one for each kind of service, hidden from assistive technology
    const art = catalogue.getByTestId('tv-service-art');
    await expect(art).toHaveCount(5);
    await expect(art.first()).toBeVisible();
    await expect(art.first()).toHaveAttribute('aria-hidden', 'true');
    await expect(catalogue.locator('.svc-art')).toHaveCount(0);
    expect(
      await art.evaluateAll((els) =>
        els.map((el) => (el as HTMLElement).dataset.art).sort(),
      ),
    ).toEqual(['app', 'oss', 'teaching', 'web', 'writing']);
    await expect(
      catalogue.getByText('I build Android and iOS apps', { exact: false }),
    ).toBeVisible();
    await expect(
      catalogue.getByRole('button', { name: /^Trade:/ }),
    ).toHaveCount(5);
  });

  test('Trade fills the topic of the ticket and its starter, and the row is marked', async ({
    page,
  }) => {
    await gotoSkin(page, '/services');
    const trade = page.getByRole('button', { name: 'Trade: App Development' });
    await trade.click();
    await expect(trade).toHaveAttribute('aria-pressed', 'true');
    await expect(
      ticket(page).getByRole('button', {
        name: 'App Development',
        exact: true,
      }),
    ).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByLabel('Message', { exact: true })).toHaveValue(
      /^Hi Bach, I'm looking for help with a mobile app/,
    );
    await expect(page.getByLabel('Message', { exact: true })).toBeFocused();
  });

  test('the topic segments behave like the chips of Standard: one at a time, again lets go, typed text is kept', async ({
    page,
  }) => {
    await gotoSkin(page, '/services');
    const topic = ticket(page).getByRole('group', { name: 'Topic' });
    await expect(topic.getByRole('button')).toHaveCount(5);
    const message = page.getByLabel('Message', { exact: true });
    await topic.getByRole('button', { name: 'App Development' }).click();
    await message.pressSequentially('My own words.');
    await topic.getByRole('button', { name: 'Open Source' }).click();
    await expect(message).toHaveValue(/^Hi Bach, I'd like to collaborate/);
    await expect(message).toHaveValue(/My own words\.$/);
    await expect(
      topic.getByRole('button', { name: 'App Development' }),
    ).toHaveAttribute('aria-pressed', 'false');
    await topic.getByRole('button', { name: 'Open Source' }).click();
    await expect(
      topic.getByRole('button', { name: 'Open Source' }),
    ).toHaveAttribute('aria-pressed', 'false');
    await expect(message).toHaveValue('My own words.');
  });

  test('an empty ticket says what is missing, focuses the first bad field and announces it', async ({
    page,
  }) => {
    await gotoSkin(page, '/services');
    await send(page).click();
    await expect(page.getByText('Name is required')).toBeVisible();
    await expect(
      page.getByText('Enter a valid email so I can reply'),
    ).toBeVisible();
    await expect(page.getByText('Message is required')).toBeVisible();
    await expect(page.getByLabel('Name')).toBeFocused();
    await expect(
      page.getByRole('status').filter({ hasText: '3 fields need attention' }),
    ).toContainText('Name, Email, Message');
    await page.getByLabel('Name').fill('Ada');
    await send(page).click();
    await expect(page.getByLabel('Email')).toBeFocused();
    await expect(
      page.getByRole('status').filter({ hasText: '2 fields need attention' }),
    ).toBeVisible();
  });

  test('the message counter counts and warns near the limit; a starter alone is not enough', async ({
    page,
  }) => {
    await gotoSkin(page, '/services');
    await expect(ticket(page).getByText(/^0\/\d+$/)).toBeVisible();
    await page.getByLabel('Message', { exact: true }).fill('Hello');
    await expect(ticket(page).getByText(/^5\/\d+$/)).toBeVisible();
    await page.getByLabel('Message', { exact: true }).fill('');
    await ticket(page)
      .getByRole('button', { name: 'Blog Writing', exact: true })
      .click();
    await page.getByLabel('Name').fill('Ada');
    await page.getByLabel('Email').fill('ada@example.com');
    await send(page).click();
    await expect(
      page.getByText('Add a few details about what you need'),
    ).toBeVisible();
  });

  test('a valid ticket is sent to the notify endpoint, shows "Message sent" with focus, and Send another starts over', async ({
    page,
  }) => {
    const received = await mockNotify(page);
    await gotoSkin(page, '/services');
    await page.getByRole('button', { name: 'Trade: App Development' }).click();
    await page.getByLabel('Name').fill('Ada Lovelace');
    await page.getByLabel('Email').fill('ada@example.com');
    await page
      .getByLabel('Message', { exact: true })
      .pressSequentially(' It is a delivery app.');
    await send(page).click();
    await expect(
      page.getByRole('heading', { name: 'Message sent' }),
    ).toBeFocused();
    await expect(
      page.getByText("Thanks, Ada Lovelace. I'll reply to ada@example.com."),
    ).toBeVisible();
    await expect
      .poll(() => received.length, { timeout: 10_000 })
      .toBeGreaterThan(0);
    expect(received[0]).toMatchObject({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      topic: 'App Development',
      locale: 'en',
    });
    await expect(
      page
        .getByRole('status')
        .filter({ hasText: 'Message sent. I will reply' }),
    ).toBeAttached();
    await ticket(page)
      .getByRole('button', { name: 'Send another message' })
      .click();
    await expect(page.getByLabel('Name')).toBeFocused();
    await expect(page.getByLabel('Name')).toHaveValue('');
  });

  test('a bot that fills the hidden field gets a pretend success and nothing is sent', async ({
    page,
  }) => {
    const received = await mockNotify(page);
    await gotoSkin(page, '/services');
    await fillValid(page);
    await page
      .locator('input[name="website"]')
      .evaluate((el: HTMLInputElement) => {
        const set = Object.getOwnPropertyDescriptor(
          HTMLInputElement.prototype,
          'value',
        )?.set;
        set?.call(el, 'http://spam.example');
        el.dispatchEvent(new Event('input', { bubbles: true }));
      });
    await send(page).click();
    await expect(
      page.getByRole('heading', { name: 'Message sent' }),
    ).toBeVisible();
    expect(received).toHaveLength(0);
  });

  test('says when the message could not be sent, keeps the text, and Try again is focused', async ({
    page,
  }) => {
    await page.goto('/services?form=error');
    await page.locator('html[data-skin-ready]').waitFor();
    await fillValid(page);
    await send(page).click();
    await expect(
      page.getByRole('alert').filter({ hasText: "Couldn't send your message" }),
    ).toBeVisible({ timeout: 10_000 });
    await expect(
      ticket(page).getByRole('button', { name: 'Try again' }),
    ).toBeFocused();
    await expect(page.getByLabel('Message', { exact: true })).toHaveValue(
      'Hello there, I need an app.',
    );
  });

  test('says the form is taking a break when its switch is off, and the rows have no Trade action', async ({
    page,
  }) => {
    await mockFirestore(page, {
      'site/live': { features: { contactForm: false } },
    });
    await gotoSkin(page, '/services');
    await expect(
      page.getByText('The contact form is taking a break.'),
    ).toBeVisible();
    await expect(page.getByLabel('Name')).toHaveCount(0);
    await expect(page.locator('#contact-cta')).toBeVisible();
    await expect(page.getByRole('button', { name: /^Trade:/ })).toHaveCount(0);
    await expect(
      page.getByRole('heading', { name: 'App Development', level: 3 }),
    ).toBeVisible();
  });

  test('Ask BB Bot opens the real chat, and is gone when the chat is off', async ({
    page,
  }) => {
    await mockWorker(page, () => ({ body: { text: 'Hello.' } }));
    await gotoSkin(page, '/services');
    await expect(page.getByText('Not sure where to start?')).toBeVisible();
    await ticket(page).getByRole('button', { name: 'Ask BB Bot' }).click();
    await expect(page.getByRole('dialog', { name: /BB Bot/ })).toBeVisible();
  });

  test('has no Ask BB Bot link when the chat is off', async ({ page }) => {
    await mockFirestore(page, { 'site/live': { features: { chat: false } } });
    await gotoSkin(page, '/services');
    await expect(page.getByLabel('Name')).toBeVisible();
    await expect(page.getByText('Not sure where to start?')).toHaveCount(0);
  });

  test('the #contact-cta link reaches the ticket', async ({ page }) => {
    await gotoSkin(page, '/services#contact-cta');
    await expect(ticket(page)).toBeInViewport();
  });

  test('the ticket stays beside the catalogue on a wide screen and comes after it on a phone', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await gotoSkin(page, '/services');
    const rows = page.getByRole('region', { name: 'Services' });
    const wide = await Promise.all([
      rows.boundingBox(),
      ticket(page).boundingBox(),
    ]);
    expect(wide[1]?.x).toBeGreaterThan(
      (wide[0]?.x ?? 0) + (wide[0]?.width ?? 0) - 1,
    );
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(ticket(page)).toBeVisible();
    const phone = await Promise.all([
      rows.boundingBox(),
      ticket(page).boundingBox(),
    ]);
    expect(phone[1]?.y).toBeGreaterThan(
      (phone[0]?.y ?? 0) + (phone[0]?.height ?? 0) - 1,
    );
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test('the ticket glows when a field has the focus', async ({ page }) => {
    await gotoSkin(page, '/services');
    const glow = ticket(page).locator('> span[aria-hidden="true"]').first();
    await expect(glow).toHaveCSS('opacity', '0');
    await page.getByLabel('Name').focus();
    await expect(glow).toHaveCSS('opacity', '1');
  });

  test('speaks Vietnamese, with the Standard validation words', async ({
    page,
  }) => {
    await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
    await gotoSkin(page, '/services');
    await expect(
      page.getByRole('heading', { name: 'Bạn muốn xây dựng điều gì?' }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Giao dịch: Phát triển ứng dụng' }),
    ).toBeVisible();
    await ticket(page)
      .getByRole('button', { name: 'Gửi', exact: true })
      .click();
    await expect(page.getByText('Vui lòng nhập tên')).toBeVisible();
  });
});
