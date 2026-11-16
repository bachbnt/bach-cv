/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test, type Locator, type Page } from '@playwright/test';
import { interceptCollection, mockFirestore } from '../support/firestore-mock';
import { mockImages } from '../support/images';
import { allOn, servePayments } from '../support/payments';
import { gotoSkin, useSkin } from '../support/skin';
import { mockNotify } from '../support/worker';

const LATEST = 'Claude Certified Architect - Professional';

test.beforeEach(async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await useSkin(page, 'phone');
  await mockFirestore(page);
  await mockImages(page);
});

const noSideScroll = (page: Page) =>
  page.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth,
  );

/** Every control and every line of text is inside the screen and inside the card that clips it (rounded corners must not hide the end of a line). */
const reachesNothingBeyond = (page: Page) =>
  page.evaluate(() => {
    const limit = window.innerWidth;
    return [...document.querySelectorAll('main *')].every((el) => {
      // decoration, the honeypot and the text for readers are not on screen to be cut off
      if (el.closest('[aria-hidden="true"], .sr-only')) return true;
      const box = el.getBoundingClientRect();
      if (box.width === 0) return true;
      if (box.left < -1 || box.right > limit + 1) return false;
      for (
        let a = el.parentElement;
        a && a.tagName !== 'MAIN';
        a = a.parentElement
      )
        if (getComputedStyle(a).overflowX !== 'visible') {
          const outer = a.getBoundingClientRect();
          if (box.left < outer.left - 1 || box.right > outer.right + 1)
            return false;
        }
      return true;
    });
  });

/** The height of a control in CSS px: the device may be drawn smaller than it is (`--ph-scale`), which a bounding box would show. */
const heightOf = (locator: Locator) =>
  locator.evaluate((el) => (el as HTMLElement).offsetHeight);

/** Where the first content of the page starts, in the coordinates of the window: the status bar and the app bar lie over the page. */
const barsBottom = (page: Page) =>
  page.evaluate(() => {
    const probe = document.createElement('div');
    probe.style.height = 'var(--ph-bars)';
    const screen = document.querySelector('[data-ph-screen]');
    const host = document.querySelector('#contact-cta') ?? screen;
    host?.append(probe);
    const bottom =
      (screen?.getBoundingClientRect().top ?? 0) +
      probe.getBoundingClientRect().height;
    probe.remove();
    return bottom;
  });

test.describe('Certificates, the Wallet', () => {
  test('are cards, newest first, with the issuer, the date and what they cover', async ({
    page,
  }) => {
    await gotoSkin(page, '/certificates');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Certificates',
    );
    const cards = page.getByTestId('certificate');
    await expect(cards).toHaveCount(3);
    await expect(cards.nth(0).getByRole('heading', { level: 2 })).toHaveText(
      LATEST,
    );
    await expect(cards.nth(1).getByRole('heading', { level: 2 })).toHaveText(
      'Google Project Management Professional Certificate',
    );
    await expect(cards.nth(2).getByRole('heading', { level: 2 })).toHaveText(
      'Google AI Professional Certificate',
    );
    const first = cards.nth(0);
    await expect(first).toContainText('Anthropic');
    await expect(first).toContainText('Issued Oct 31, 2026');
    await expect(
      first.getByRole('list', { name: 'Skills covered' }).getByRole('listitem'),
    ).toHaveText(['Claude Code', 'MCP', 'AI agents']);
    await expect(page.getByText('Latest', { exact: true })).toHaveCount(1);
    await expect(first.getByText('Latest', { exact: true })).toBeVisible();
  });

  test('keep Open PDF on the card, opening in a new tab', async ({ page }) => {
    await gotoSkin(page, '/certificates');
    const pdf = page
      .getByTestId('certificate')
      .first()
      .getByRole('link', { name: /Open PDF/ });
    await expect(pdf).toHaveAttribute('href', /claude-architect\.pdf$/);
    await expect(pdf).toHaveAttribute('target', '_blank');
    await expect(pdf).toHaveAttribute('rel', /noopener/);
  });

  test('open the picture in the viewer, which steps through them all', async ({
    page,
  }) => {
    await gotoSkin(page, '/certificates');
    await page
      .getByRole('button', {
        name: 'View Google Project Management Professional Certificate certificate',
      })
      .click();
    const dialog = page.getByRole('dialog');
    await expect(
      dialog.getByText('Google Project Management Professional Certificate'),
    ).toBeVisible();
    await dialog.getByRole('button', { name: 'Next certificate' }).click();
    await expect(
      dialog.getByText('Google AI Professional Certificate'),
    ).toBeVisible();
    await dialog.getByRole('button', { name: 'Close preview' }).click();
    await expect(dialog).toBeHidden();
  });

  for (const width of [320, 390])
    test(`have no horizontal scroll and nothing cut off at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 800 });
      await gotoSkin(page, '/certificates');
      await expect(page.getByTestId('certificate')).toHaveCount(3);
      expect(await noSideScroll(page)).toBe(true);
      expect(await reachesNothingBeyond(page)).toBe(true);
    });

  test('show a skeleton while the data is on its way', async ({ page }) => {
    await interceptCollection(page, 'certificates', { delay: 1500 });
    await gotoSkin(page, '/certificates');
    const loading = page.getByRole('status', { name: 'Loading' }).first();
    await expect(loading).toBeVisible();
    await expect(loading).toHaveAttribute('aria-busy', 'true');
    await expect(page.getByText(LATEST).first()).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByRole('status', { name: 'Loading' })).toHaveCount(0);
  });

  test('say there is nothing to show yet, with a way forward', async ({
    page,
  }) => {
    await interceptCollection(page, 'certificates', 'empty');
    await gotoSkin(page, '/certificates');
    const notice = page.locator('[data-state="empty"]');
    await expect(
      notice.getByRole('heading', { name: 'No certificates to show yet' }),
    ).toBeVisible();
    await expect(notice.getByRole('link')).toHaveCount(1);
  });

  test('say they could not load, and Try again loads them', async ({
    page,
  }) => {
    await interceptCollection(page, 'certificates', 'error');
    await gotoSkin(page, '/certificates');
    const alert = page.locator('[data-state="error"]');
    await expect(alert).toBeVisible({ timeout: 20_000 });
    await expect(
      alert.getByRole('heading', { name: "Certificates couldn't be loaded" }),
    ).toBeVisible();
    await page.unroute('**/firestore.googleapis.com/**');
    await mockFirestore(page);
    await alert.getByRole('button', { name: 'Try again' }).click();
    await expect(page.getByText(LATEST).first()).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.locator('[data-state="error"]')).toHaveCount(0);
  });

  test('a page that is coming soon says so, a hidden one is not found', async ({
    page,
  }) => {
    await mockFirestore(page, {
      'site/live': { pages: { certificates: 'soon' } },
    });
    await gotoSkin(page, '/certificates');
    await expect(
      page.getByRole('heading', { name: 'This page is coming soon.' }),
    ).toBeVisible();
    await page.unroute('**/firestore.googleapis.com/**');
    await mockFirestore(page, {
      'site/live': { pages: { certificates: 'hidden' } },
    });
    await gotoSkin(page, '/certificates');
    await expect(
      page.getByRole('heading', { name: "This page doesn't exist." }),
    ).toBeVisible();
  });

  test('in Vietnamese show the words of Vietnamese Standard', async ({
    page,
  }) => {
    await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
    await gotoSkin(page, '/certificates');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Chứng chỉ',
    );
    const first = page.getByTestId('certificate').first();
    await expect(first).toContainText('Cấp ngày 31/10/2026');
    await expect(first.getByRole('link', { name: /Mở PDF/ })).toBeVisible();
    await expect(page.getByText('Mới nhất', { exact: true })).toHaveCount(1);
  });
});

const fillForm = async (page: Page) => {
  await page.getByLabel('Name').fill('Ada Lovelace');
  await page.getByLabel('Email').fill('ada@example.com');
  await page.getByLabel('Message', { exact: true }).fill('I need an app.');
};

const liveRegion = (page: Page) => page.locator('#contact-cta [role="status"]');

test.describe('Services, the App Store', () => {
  test('list the services as cards with the topic chips of the form', async ({
    page,
  }) => {
    await gotoSkin(page, '/services');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Services',
    );
    const list = page.getByRole('list', { name: 'Services' });
    await expect(list.getByRole('listitem')).toHaveCount(5);
    await expect(
      page.getByRole('heading', { name: 'App Development', level: 2 }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Blog Writing', level: 2 }),
    ).toBeVisible();
    const chips = page
      .getByRole('group', { name: 'Topic' })
      .getByRole('button');
    await expect(chips).toHaveCount(5);
    await expect(chips.first()).toHaveText('App Development');
    await expect(page.locator('#contact-cta')).toBeAttached();
  });

  test('Discuss starts the message on that topic, takes you to the form and keeps the topic if pressed again', async ({
    page,
  }) => {
    await gotoSkin(page, '/services');
    const message = page.getByLabel('Message', { exact: true });
    await page.getByRole('button', { name: 'Discuss Web Development' }).click();
    await expect(
      page.getByRole('button', { name: 'Web Development', exact: true }),
    ).toHaveAttribute('aria-pressed', 'true');
    await expect(message).toHaveValue(
      /^Hi Bach, I'd like a website or web app built/,
    );
    await expect(message).toBeFocused();
    await expect(message).toBeInViewport();
    await page.getByRole('button', { name: 'Discuss Web Development' }).click();
    await expect(
      page.getByRole('button', { name: 'Web Development', exact: true }),
    ).toHaveAttribute('aria-pressed', 'true');
    await expect(message).toHaveValue(
      /^Hi Bach, I'd like a website or web app built/,
    );
  });

  test('a topic chip writes the starting text and keeps what was typed', async ({
    page,
  }) => {
    await gotoSkin(page, '/services');
    const message = page.getByLabel('Message', { exact: true });
    const app = page.getByRole('button', {
      name: 'App Development',
      exact: true,
    });
    const web = page.getByRole('button', {
      name: 'Web Development',
      exact: true,
    });
    await app.click();
    await expect(app).toHaveAttribute('aria-pressed', 'true');
    await expect(message).toHaveValue(
      /^Hi Bach, I'm looking for help with a mobile app/,
    );
    await expect(message).toBeFocused();
    await message.pressSequentially('a delivery app');
    await web.click();
    await expect(app).toHaveAttribute('aria-pressed', 'false');
    await expect(message).toHaveValue(
      /^Hi Bach, I'd like a website or web app built\. What I have in mind: a delivery app$/,
    );
    await web.click();
    await expect(message).toHaveValue('a delivery app');
  });

  for (const width of [320, 390])
    test(`have no horizontal scroll and nothing cut off at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 800 });
      await gotoSkin(page, '/services');
      await expect(
        page.getByRole('heading', { name: 'App Development', level: 2 }),
      ).toBeVisible();
      expect(await noSideScroll(page)).toBe(true);
      expect(await reachesNothingBeyond(page)).toBe(true);
    });

  test('give every control of the form a finger-sized target', async ({
    page,
  }) => {
    await gotoSkin(page, '/services');
    for (const locator of [
      page.getByLabel('Name'),
      page.getByLabel('Email'),
      page.getByRole('button', { name: 'Send' }),
      page.getByRole('button', { name: 'Discuss Web Development' }),
      page.getByRole('button', { name: 'Web Development', exact: true }),
    ]) {
      expect(await heightOf(locator)).toBeGreaterThanOrEqual(44);
    }
  });
});

test.describe('the contact form', () => {
  test('validation sets aria-invalid, announces and focuses the first problem', async ({
    page,
  }) => {
    await gotoSkin(page, '/services');
    await page.getByRole('button', { name: 'Send' }).click();
    for (const label of ['Name', 'Email'])
      await expect(page.getByLabel(label)).toHaveAttribute(
        'aria-invalid',
        'true',
      );
    await expect(page.getByLabel('Message', { exact: true })).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    await expect(page.getByLabel('Name')).toBeFocused();
    await expect(page.getByText('Name is required')).toBeVisible();
    await expect(
      page.getByText('Enter a valid email so I can reply'),
    ).toBeVisible();
    await expect(page.getByText('Message is required')).toBeVisible();
    // each error is an alert, and the live region says how many fields need attention
    await expect(
      page.getByRole('alert').filter({ hasText: 'Name is required' }),
    ).toBeVisible();
    await expect(liveRegion(page)).toHaveText(
      '3 fields need attention: Name, Email, Message',
    );
    await page.getByLabel('Name').fill('Ada');
    await expect(page.getByLabel('Name')).toHaveAttribute(
      'aria-invalid',
      'false',
    );
  });

  test('the counter warns near the limit and stops at it', async ({ page }) => {
    await gotoSkin(page, '/services');
    const message = page.getByLabel('Message', { exact: true });
    await message.fill('x'.repeat(899));
    await expect(page.getByText('899/1000')).not.toHaveClass(/text-ph-danger/);
    await message.fill('x'.repeat(900));
    await expect(page.getByText('900/1000')).toHaveClass(/text-ph-danger/);
    await message.pressSequentially('y'.repeat(150));
    await expect(page.getByText('Limit reached, 1000/1000')).toBeVisible();
  });

  test('Send is disabled while sending', async ({ page }) => {
    await gotoSkin(page, '/services?form=error');
    await fillForm(page);
    await page.getByRole('button', { name: 'Send' }).click();
    await expect(page.getByRole('button', { name: /Sending/ })).toBeDisabled();
  });

  test('a message is written to Firestore and the success state shows', async ({
    page,
  }) => {
    const writes: string[] = [];
    page.on('request', (r) => {
      if (r.url().includes(':commit')) writes.push(r.postData() ?? '');
    });
    await gotoSkin(page, '/services');
    await page
      .getByRole('button', { name: 'Web Development', exact: true })
      .click();
    await expect(page.getByLabel('Message', { exact: true })).toBeFocused();
    await fillForm(page);
    await page.getByRole('button', { name: 'Send' }).click();
    const done = page.getByRole('heading', { name: 'Message sent' });
    await expect(done).toBeVisible();
    await expect(done).toBeFocused();
    await expect(
      page.getByText("Thanks, Ada Lovelace. I'll reply to ada@example.com."),
    ).toBeVisible();
    expect(writes).toHaveLength(1);
    expect(writes[0]).toContain('ada@example.com');
    expect(writes[0]).toContain('messages');
    await page.getByRole('button', { name: 'Send another message' }).click();
    await expect(page.getByLabel('Name')).toBeFocused();
    await expect(page.getByLabel('Name')).toHaveValue('');
  });

  test('after the message is saved the Worker is asked to email it to the owner', async ({
    page,
  }) => {
    const received = await mockNotify(page);
    await gotoSkin(page, '/services');
    await page
      .getByRole('button', { name: 'Web Development', exact: true })
      .click();
    await expect(page.getByLabel('Message', { exact: true })).toBeFocused();
    await fillForm(page);
    await page.getByRole('button', { name: 'Send' }).click();
    await expect(
      page.getByRole('heading', { name: 'Message sent' }),
    ).toBeVisible();
    await expect.poll(() => received.length).toBe(1);
    expect(received[0]).toMatchObject({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      topic: 'Web Development',
      locale: 'en',
    });
  });

  test('a failed send keeps the text and offers another try', async ({
    page,
  }) => {
    const received = await mockNotify(page);
    await page.route('**/firestore.googleapis.com/**:commit*', (route) =>
      route.abort('failed'),
    );
    await gotoSkin(page, '/services');
    await fillForm(page);
    await page.getByRole('button', { name: 'Send' }).click();
    await expect(
      page.getByRole('alert').filter({ hasText: "Couldn't send" }),
    ).toContainText("Couldn't send your message");
    await expect(page.getByLabel('Message', { exact: true })).toHaveValue(
      'I need an app.',
    );
    await expect(page.getByRole('button', { name: 'Try again' })).toBeFocused();
    expect(received).toHaveLength(0);
  });

  test('a filled honeypot pretends success and sends nothing', async ({
    page,
  }) => {
    let writes = 0;
    page.on('request', (r) => {
      if (r.url().includes(':commit')) writes++;
    });
    await gotoSkin(page, '/services');
    await fillForm(page);
    await page
      .locator('input[name="website"]')
      .fill('http://spam.example', { force: true });
    await page.getByRole('button', { name: 'Send' }).click();
    await expect(
      page.getByRole('heading', { name: 'Message sent' }),
    ).toBeVisible();
    expect(writes).toBe(0);
  });

  test('is replaced by a note, and Discuss is gone, when site/live turns it off', async ({
    page,
  }) => {
    await page.unroute('**/firestore.googleapis.com/**');
    await mockFirestore(page, {
      'site/live': { features: { contactForm: false } },
    });
    await gotoSkin(page, '/services');
    await expect(
      page.getByText('The contact form is taking a break.'),
    ).toBeVisible();
    await expect(page.getByLabel('Message', { exact: true })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /^Discuss/ })).toHaveCount(0);
  });

  test('"Ask BB Bot" is in the section, and is gone when the chat is off', async ({
    page,
  }) => {
    await gotoSkin(page, '/services');
    await expect(
      page.locator('#contact-cta').getByRole('button', { name: 'Ask BB Bot' }),
    ).toBeVisible();
    await page.unroute('**/firestore.googleapis.com/**');
    await mockFirestore(page, { 'site/live': { features: { chat: false } } });
    // the switches the first visit kept in the browser (written again as that page closes) would show instead of the new ones
    await page.addInitScript(() => localStorage.removeItem('bach-cv-query'));
    await gotoSkin(page, '/services');
    await expect(
      page.locator('#contact-cta').getByRole('button', { name: 'Ask BB Bot' }),
    ).toHaveCount(0);
  });
});

test.describe('the states of Services', () => {
  test('says it could not load the services, and Try again loads them', async ({
    page,
  }) => {
    await interceptCollection(page, 'services', 'error');
    await gotoSkin(page, '/services');
    const alert = page.locator('[data-state="error"]');
    await expect(alert).toBeVisible({ timeout: 20_000 });
    await expect(
      alert.getByRole('heading', { name: "Services couldn't be loaded" }),
    ).toBeVisible();
    await page.unroute('**/firestore.googleapis.com/**');
    await mockFirestore(page);
    await alert.getByRole('button', { name: 'Try again' }).click();
    await expect(
      page.getByRole('heading', { name: 'App Development', level: 2 }),
    ).toBeVisible({ timeout: 15_000 });
  });

  test('shows a skeleton while the data is on its way', async ({ page }) => {
    await interceptCollection(page, 'services', { delay: 1500 });
    await gotoSkin(page, '/services');
    await expect(
      page.getByRole('status', { name: 'Loading' }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'App Development', level: 2 }),
    ).toBeVisible({ timeout: 15_000 });
  });

  test('a page that is coming soon says so', async ({ page }) => {
    await mockFirestore(page, { 'site/live': { pages: { services: 'soon' } } });
    await gotoSkin(page, '/services');
    await expect(
      page.getByRole('heading', { name: 'This page is coming soon.' }),
    ).toBeVisible();
  });

  test('in Vietnamese the page, the validation and the success state are Vietnamese', async ({
    page,
  }) => {
    await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
    await gotoSkin(page, '/services');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Dịch vụ');
    await expect(
      page.getByRole('heading', { name: 'Bạn muốn xây dựng điều gì?' }),
    ).toBeVisible();
    await expect(
      page.getByRole('group', { name: 'Chủ đề' }).getByRole('button'),
    ).toHaveCount(5);
    await expect(
      page.getByRole('button', { name: /^Trao đổi về/ }),
    ).toHaveCount(5);
    await page.getByRole('button', { name: 'Gửi' }).click();
    await expect(page.getByText('Vui lòng nhập tên')).toBeVisible();
    await page.getByLabel('Tên').fill('Ada');
    await page.getByLabel('Email').fill('ada@example.com');
    await page
      .getByLabel('Tin nhắn', { exact: true })
      .fill('Mình cần một app.');
    await page.getByRole('button', { name: 'Gửi' }).click();
    await expect(
      page.getByRole('heading', { name: 'Đã gửi tin nhắn' }),
    ).toBeVisible();
  });
});

test.describe('Payment, Wallet and Payments', () => {
  test('a highlighted method comes first on a card and the others follow in a list; hidden ones never show', async ({
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
    await expect(
      page.getByRole('listitem').filter({ hasText: 'MoMo' }),
    ).toHaveCount(1);
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
  });

  test('the other methods are grouped by kind and filtered by bank and wallet, and no label carries a count', async ({
    page,
  }) => {
    await servePayments(page, allOn());
    await gotoSkin(page, '/payment');
    const rows = page.getByRole('listitem').filter({
      has: page.getByRole('button', { name: 'Copy number' }),
    });
    await expect(rows).toHaveCount(8);
    await expect(
      page.getByRole('heading', { level: 3, name: 'Bank', exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 3, name: 'Wallet', exact: true }),
    ).toBeVisible();
    const filter = page.getByRole('group', { name: 'Filter payment methods' });
    await filter.getByRole('button', { name: 'Bank' }).click();
    await expect(rows).toHaveCount(2);
    await expect(
      page.getByRole('heading', { level: 3, name: 'Wallet', exact: true }),
    ).toHaveCount(0);
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
    const row = page
      .getByRole('listitem')
      .filter({ has: page.getByRole('button', { name: 'Copy number' }) })
      .first();
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
    await interceptCollection(page, 'payments', { delay: 1500 });
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
    await interceptCollection(page, 'payments', 'error');
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

  for (const width of [320, 390])
    test(`has no horizontal scroll and nothing cut off at ${width}px`, async ({
      page,
    }) => {
      await servePayments(page, allOn());
      await page.setViewportSize({ width, height: 800 });
      await gotoSkin(page, '/payment');
      await expect(page.getByTestId('payment-method').first()).toBeVisible();
      expect(await noSideScroll(page)).toBe(true);
      expect(await reachesNothingBeyond(page)).toBe(true);
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

test.describe('the form of Services is a form of a phone', () => {
  test('has the keyboards and hints a phone offers for each field', async ({
    page,
  }) => {
    await gotoSkin(page, '/services');
    const email = page.getByLabel('Email');
    await expect(email).toHaveAttribute('type', 'email');
    await expect(email).toHaveAttribute('inputmode', 'email');
    await expect(email).toHaveAttribute('autocomplete', 'email');
    await expect(email).toHaveAttribute('enterkeyhint', 'next');
    await expect(email).toHaveAttribute('autocapitalize', 'none');
    const name = page.getByLabel('Name');
    await expect(name).toHaveAttribute('autocomplete', 'name');
    await expect(name).toHaveAttribute('enterkeyhint', 'next');
    await expect(page.getByLabel('Message', { exact: true })).toHaveAttribute(
      'enterkeyhint',
      'enter',
    );
  });

  test('the label sits in the field and floats up once the field is focused or has text', async ({
    page,
  }) => {
    await gotoSkin(page, '/services');
    const box = (label: string) =>
      page
        .locator(`label[for="${label}"]`)
        .evaluate((el) => el.getBoundingClientRect().height);
    const scale = (label: string) =>
      page
        .locator(`label[for="${label}"]`)
        .evaluate((el) => getComputedStyle(el).scale);
    expect(await box('f-name')).toBeGreaterThan(40);
    expect(await scale('f-name')).toBe('none');
    await page.getByLabel('Name').fill('Ada');
    await page.getByLabel('Email').focus();
    await expect.poll(() => scale('f-name')).toBe('0.78');
    await expect.poll(() => scale('f-email')).toBe('0.78');
    await expect.poll(() => scale('f-message')).toBe('none');
  });

  test('the confirmation is a status with a drawn check mark', async ({
    page,
  }) => {
    await gotoSkin(page, '/services');
    await fillForm(page);
    await page.getByRole('button', { name: 'Send' }).click();
    // not the line for screen readers, which says the same in a few words
    const done = page
      .locator('#contact-cta')
      .getByRole('status')
      .filter({ has: page.getByRole('heading', { name: 'Message sent' }) });
    await expect(done).toBeVisible();
    await expect(done.locator('svg[aria-hidden="true"] path')).toHaveCount(1);
  });
});

test.describe('on a tablet window (full-bleed, 1024 px)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
  });

  test('Certificates: the newest spans the width, the others sit side by side', async ({
    page,
  }) => {
    await gotoSkin(page, '/certificates');
    // the cards arrive after the page: measure them once they are all there
    await expect(page.getByTestId('certificate')).toHaveCount(3);
    const boxes = await page.getByTestId('certificate').evaluateAll((els) =>
      els.map((el) => {
        const b = el.getBoundingClientRect();
        return { left: b.left, top: b.top, width: b.width };
      }),
    );
    expect(boxes[1].width).toBeCloseTo(boxes[2].width, 0);
    expect(boxes[1].top).toBeCloseTo(boxes[2].top, 0);
    expect(boxes[0].width).toBeGreaterThan(boxes[1].width * 1.9);
    expect(await noSideScroll(page)).toBe(true);
  });

  test('Services: rows in two columns, and the column of the form does not go under the bars while the form scrolls', async ({
    page,
  }) => {
    await gotoSkin(page, '/services');
    const rows = page
      .getByRole('list', { name: 'Services' })
      .getByRole('listitem');
    const [a, b] = [
      await rows.nth(0).boundingBox(),
      await rows.nth(1).boundingBox(),
    ];
    expect(a?.y).toBeCloseTo(b?.y ?? -1, 0);
    expect(b?.x ?? 0).toBeGreaterThan((a?.x ?? 0) + (a?.width ?? 0));
    const heading = page.getByRole('heading', {
      name: 'What do you want to build?',
    });
    // a tablet screen scrolls inside itself (the document does not scroll): scroll whatever holds the form
    await page.evaluate(() => {
      const target = document.getElementById('contact-cta');
      if (!target) return;
      let holder: HTMLElement | null = target.parentElement;
      while (
        holder &&
        !/(auto|scroll)/.test(getComputedStyle(holder).overflowY)
      )
        holder = holder.parentElement;
      if (holder)
        holder.scrollTop +=
          target.getBoundingClientRect().top -
          holder.getBoundingClientRect().top +
          120;
      else
        window.scrollTo(
          0,
          target.getBoundingClientRect().top + window.scrollY + 120,
        );
    });
    await page.waitForTimeout(200);
    const box = await heading.boundingBox();
    const bars = await barsBottom(page);
    // the bars lie over the page: the column of the heading stops below them instead of going under (the page may end before it sticks)
    expect(box?.y ?? 0).toBeGreaterThanOrEqual(bars - 1);
    expect(box?.y ?? 9999).toBeLessThan(768);
  });

  test('Services: Discuss brings the form below the sticky bars', async ({
    page,
  }) => {
    await gotoSkin(page, '/services');
    await page.getByRole('button', { name: 'Discuss Blog Writing' }).click();
    await expect(page.getByLabel('Message', { exact: true })).toBeInViewport();
    await page.waitForTimeout(500);
    const top = await page
      .locator('#contact-cta')
      .evaluate((el) => el.getBoundingClientRect().top);
    expect(top).toBeGreaterThanOrEqual((await barsBottom(page)) - 1);
  });

  test('Payment: a bank card at the left, its QR code and copy buttons at the right', async ({
    page,
  }) => {
    await servePayments(page, allOn());
    await gotoSkin(page, '/payment');
    const card = page.getByRole('article', { name: 'BIDV' });
    const face = await card.locator('> div').nth(0).boundingBox();
    const actions = await card
      .getByRole('button', { name: 'Copy number' })
      .boundingBox();
    expect(actions?.x ?? 0).toBeGreaterThan(
      (face?.x ?? 0) + (face?.width ?? 0),
    );
    expect(await noSideScroll(page)).toBe(true);
  });
});

/** The controls and fields of the page whose box is crossed by the vertical line `x`. */
const crossing = (page: Page, x: number) =>
  page.evaluate((line) => {
    const hits: string[] = [];
    for (const el of document.querySelectorAll(
      'main button, main a[href], main input, main textarea',
    )) {
      if (el.closest('[aria-hidden="true"]')) continue;
      const box = el.getBoundingClientRect();
      if (box.width > 0 && box.left < line - 1 && box.right > line + 1)
        hits.push(
          `${el.getAttribute('aria-label') ?? el.textContent ?? el.tagName} ${Math.round(box.left)}-${Math.round(box.right)}`,
        );
    }
    return hits;
  }, x);

const screenBox = async (page: Page) =>
  (await page.locator('[data-ph-screen]').boundingBox()) ?? {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  };

test.describe('on the open device (1280 x 860, the default)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 860 });
  });

  test('the screen has a crease and the two columns of each page lie either side of it', async ({
    page,
  }) => {
    await servePayments(page, allOn());
    for (const route of ['/certificates', '/services', '/payment']) {
      await gotoSkin(page, route);
      await expect(page.locator('[data-ph-screen]')).toHaveAttribute(
        'data-hinge',
        '',
      );
      const box = await screenBox(page);
      expect(box.width).toBeGreaterThan(1000);
      expect(await crossing(page, box.x + box.width / 2)).toEqual([]);
    }
  });

  test('Services: the form is below the bar of the app after Discuss, and its column stays in view', async ({
    page,
  }) => {
    await gotoSkin(page, '/services');
    await page.getByRole('button', { name: 'Discuss Blog Writing' }).click();
    const message = page.getByLabel('Message', { exact: true });
    await expect(message).toBeFocused();
    const heading = page.getByRole('heading', {
      name: 'What do you want to build?',
    });
    const bars = await barsBottom(page);
    // the scroll to the section is smooth: wait until it has come to rest; the bars lie over the page and the column of the heading is
    // sticky just below them
    await expect
      .poll(async () => (await heading.boundingBox())?.y ?? 0)
      .toBeGreaterThanOrEqual(bars - 1);
    await expect
      .poll(async () => (await heading.boundingBox())?.y ?? 9999)
      .toBeLessThan(bars + 200);
    const top = await page
      .locator('#contact-cta')
      .evaluate((el) => el.getBoundingClientRect().top);
    expect(top).toBeGreaterThanOrEqual(bars - 1);
  });

  test('the page scrolls inside the screen, not the document', async ({
    page,
  }) => {
    await gotoSkin(page, '/services');
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollHeight <=
          document.documentElement.clientHeight,
      ),
    ).toBe(true);
  });
});

test.describe('on the folded device (the cover screen)', () => {
  test.use({ hasTouch: true });
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() =>
      localStorage.setItem('bach-cv-phone-fold', 'folded'),
    );
    await page.setViewportSize({ width: 1280, height: 860 });
  });

  test('is the phone layout: one column, no crease, nothing wider than the screen', async ({
    page,
  }) => {
    await servePayments(page, allOn());
    await gotoSkin(page, '/services');
    const screen = await screenBox(page);
    expect(screen.width).toBeLessThan(600);
    await expect(page.locator('[data-ph-screen]')).not.toHaveAttribute(
      'data-hinge',
      '',
    );
    const rows = page
      .getByRole('list', { name: 'Services' })
      .getByRole('listitem');
    const [a, b] = [
      await rows.nth(0).boundingBox(),
      await rows.nth(1).boundingBox(),
    ];
    expect(a?.x).toBeCloseTo(b?.x ?? -1, 0);
    expect(b?.y ?? 0).toBeGreaterThan((a?.y ?? 0) + (a?.height ?? 0) - 1);
    await gotoSkin(page, '/certificates');
    const cards = page.getByTestId('certificate');
    expect((await cards.nth(0).boundingBox())?.width).toBeCloseTo(
      (await cards.nth(1).boundingBox())?.width ?? -1,
      0,
    );
    expect(await reachesNothingBeyond(page)).toBe(true);
  });

  test('gives every control of Services and Payment a finger-sized target', async ({
    page,
  }) => {
    await servePayments(page, allOn());
    await gotoSkin(page, '/services');
    for (const locator of [
      page.getByLabel('Name'),
      page.getByLabel('Email'),
      page.getByRole('button', { name: 'Send' }),
      page.getByRole('button', { name: 'Discuss Web Development' }),
      page.getByRole('button', { name: 'Web Development', exact: true }),
      page.getByRole('button', { name: 'Ask BB Bot' }).last(),
    ]) {
      expect(await heightOf(locator)).toBeGreaterThanOrEqual(44);
    }
    await gotoSkin(page, '/payment');
    for (const locator of [
      page.getByRole('button', { name: 'Copy number' }).first(),
      page.getByRole('button', { name: 'Copy all details' }).first(),
      page.getByRole('button', { name: 'Bank', exact: true }),
    ]) {
      expect(await heightOf(locator)).toBeGreaterThanOrEqual(44);
    }
  });

  test('Fold unfolds it into the tablet layout and back', async ({ page }) => {
    await gotoSkin(page, '/services');
    const fold = page.getByRole('button', { name: 'Fold', exact: true });
    await expect(fold).toHaveAttribute('aria-pressed', 'true');
    await fold.click();
    await expect(fold).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('[data-ph-screen]')).toHaveAttribute(
      'data-hinge',
      '',
    );
    const rows = page
      .getByRole('list', { name: 'Services' })
      .getByRole('listitem');
    await expect
      .poll(
        async () =>
          ((await rows.nth(1).boundingBox())?.x ?? 0) -
          ((await rows.nth(0).boundingBox())?.x ?? 0),
      )
      .toBeGreaterThan(100);
    // a fold asked for in the middle of a swing waits for it
    await expect(page.locator('.ph-rig')).toHaveAttribute('data-phase', 'idle');
    await fold.click();
    await expect(page.locator('[data-ph-screen]')).not.toHaveAttribute(
      'data-hinge',
      '',
    );
  });
});

const SHORT = 'Short title';
const LONG =
  'A very long certificate title that goes on over two or even three lines of a card';

/** Serves these certificates from the browser's Firestore query, on top of `mockFirestore`, one document for each name (newest first). */
const serveCertificates = async (page: Page, names: string[]) => {
  const stamp = '2026-11-04T00:00:00.000000Z';
  const str = (value: string) => ({ stringValue: value });
  await page.route('**/firestore.googleapis.com/**', async (route) => {
    const request = route.request();
    const body = request.postDataJSON?.() ?? {};
    if (
      !request.url().includes(':runQuery') ||
      body.structuredQuery?.from?.[0]?.collectionId !== 'certificates'
    )
      return route.fallback();
    const base =
      request
        .url()
        .match(/projects\/[^/]+\/databases\/\(default\)\/documents/)?.[0] ?? '';
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(
        names.map((name, i) => ({
          document: {
            name: `${base}/certificates/c${i}`,
            fields: {
              visible: { booleanValue: true },
              highlight: { nullValue: null },
              name: str(name),
              issuer: str('Google / Coursera'),
              issuedAt: str(`2026-0${9 - i}-15`),
              image: str(
                'https://raw.githubusercontent.com/bachbnt/assets/main/certificate/google-ai.webp',
              ),
              pdfUrl: str(
                'https://cdn.jsdelivr.net/gh/bachbnt/assets@main/certificate/google-ai.pdf',
              ),
              credentialUrl: str(''),
              skills: {
                arrayValue: {
                  values: (i % 2
                    ? ['agile', 'mcp', 'claude-code']
                    : ['agile']
                  ).map(str),
                },
              },
              l10n: { mapValue: { fields: {} } },
            },
            createTime: stamp,
            updateTime: stamp,
          },
          readTime: stamp,
        })),
      ),
    });
  });
};

/** The parts of every card of the Wallet: the face, the picture block and the tags and action, */
const wallet = (page: Page) =>
  page.getByTestId('certificate').evaluateAll((cards) =>
    cards.map((card) => {
      const parts = [...card.children].map((part) =>
        part.getBoundingClientRect(),
      );
      return {
        width: card.getBoundingClientRect().width,
        face: parts[0],
        picture: parts[1],
        details: parts[2],
        title: card.querySelector('h2')?.getBoundingClientRect().height ?? 0,
        pdf: card.querySelector('a')?.getBoundingClientRect().top ?? 0,
      };
    }),
  );

test.describe('the cards of one row of the Wallet line up', () => {
  const sets: Record<string, string[]> = {
    '3 certificates, the newest spans': [LATEST, SHORT, LONG],
    '4 certificates': [SHORT, LONG, LONG, SHORT],
    '5 certificates, the newest spans': [LATEST, SHORT, LONG, LONG, SHORT],
  };
  for (const [label, names] of Object.entries(sets))
    for (const lang of ['en', 'vi'])
      for (const [width, height] of [
        [1024, 768],
        [1280, 860],
      ])
        test(`${label}, in ${lang}, at ${width} px`, async ({ page }) => {
          await page.addInitScript(
            (l) => localStorage.setItem('bach-cv-lang', l),
            lang,
          );
          await serveCertificates(page, names);
          await page.setViewportSize({ width, height });
          await gotoSkin(page, '/certificates');
          await expect(page.getByTestId('certificate')).toHaveCount(
            names.length,
          );
          const cards = await wallet(page);
          const rows = new Map<number, typeof cards>();
          for (const card of cards) {
            const key = Math.round(card.face.top);
            rows.set(key, [...(rows.get(key) ?? []), card]);
          }
          // the cards that share a row: two of them, with the same parts at the same heights
          const pairs = [...rows.values()].filter((row) => row.length === 2);
          expect(pairs.length).toBe(Math.floor(names.length / 2));
          for (const [a, b] of pairs) {
            expect(a.face.height).toBeCloseTo(b.face.height, 0);
            expect(a.picture.top).toBeCloseTo(b.picture.top, 0);
            expect(a.picture.height).toBeCloseTo(b.picture.height, 0);
            expect(a.details.top).toBeCloseTo(b.details.top, 0);
            expect(a.pdf).toBeCloseTo(b.pdf, 0);
          }
          // the titles of a pair differ in length, or the check proves nothing
          expect(pairs.some(([a, b]) => Math.abs(a.title - b.title) > 10)).toBe(
            true,
          );
          expect(await noSideScroll(page)).toBe(true);
        });
});

test.describe('the cards of the Wallet are plain', () => {
  // the join of the face and the picture is only a join: no cut-outs (masks) and no drop shadow of what is drawn (filter) come back by accident
  for (const [width, height] of [
    [390, 844],
    [1280, 860],
  ])
    test(`no mask and no filter on the card at ${width} px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height });
      await gotoSkin(page, '/certificates');
      await expect(page.getByTestId('certificate')).toHaveCount(3);
      const styles = await page
        .getByTestId('certificate')
        .evaluateAll((cards) =>
          cards.flatMap((card) =>
            [card, ...card.children].map((part) => {
              const style = getComputedStyle(part);
              return { mask: style.maskImage, filter: style.filter };
            }),
          ),
        );
      for (const style of styles) {
        expect(style.mask).toBe('none');
        expect(style.filter).toBe('none');
      }
    });
});

test.describe('/services#contact-cta opens on the form', () => {
  const cases = [
    { name: '390 px, the window is the phone', width: 390, height: 844 },
    { name: 'the open device', width: 1280, height: 860 },
    { name: 'the folded device', width: 1280, height: 860, folded: true },
  ];
  for (const { name, width, height, folded } of cases)
    test(`at ${name}`, async ({ page }) => {
      if (folded)
        await page.addInitScript(() =>
          localStorage.setItem('bach-cv-phone-fold', 'folded'),
        );
      await page.setViewportSize({ width, height });
      await gotoSkin(page, '/services#contact-cta');
      const bars = await barsBottom(page);
      const screen = await screenBox(page);
      // the rows above have their data by now and the page has come to rest on the form, below the bars and inside the screen
      await expect
        .poll(async () =>
          page
            .locator('#contact-cta')
            .evaluate((el) => el.getBoundingClientRect().top),
        )
        .toBeGreaterThanOrEqual(bars - 1);
      await expect
        .poll(async () =>
          page
            .locator('#contact-cta')
            .evaluate((el) => el.getBoundingClientRect().top),
        )
        .toBeLessThan(screen.y + screen.height - 100);
      await expect(page.getByLabel('Name')).toBeInViewport();
    });
});
