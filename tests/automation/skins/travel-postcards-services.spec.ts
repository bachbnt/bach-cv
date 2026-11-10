/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test, type Page } from '@playwright/test';
import { mockFirestore, interceptCollection } from '../support/firestore-mock';
import { mockImages } from '../support/images';
import { animationsSettled } from '../support/animations';
import { gotoSkin, useSkin } from '../support/skin';
import { mockNotify } from '../support/worker';

test.beforeEach(async ({ page }) => {
  await useSkin(page, 'travel');
  await mockFirestore(page);
  await mockImages(page);
});

const fill = async (page: Page) => {
  await page.getByLabel('Name').fill('Ada Lovelace');
  await page.getByLabel('Email').fill('ada@example.com');
  await page.getByLabel('Message', { exact: true }).fill('I need an app.');
};

const liveRegion = (page: Page) => page.locator('#contact-cta [role="status"]');
const topics = (page: Page) =>
  page.getByRole('group', { name: 'Topic' }).getByRole('button');

test.describe('the tours', () => {
  test('every service is a tour with a name, a description and its own icon tile', async ({
    page,
  }) => {
    await gotoSkin(page, '/services');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Services',
    );
    await expect(page.getByText('Tours you can book')).toBeVisible();
    await expect(
      page.getByText('What I can do for your team or project.'),
    ).toBeVisible();
    const list = page.getByRole('list', { name: 'Services' });
    await expect(list.getByRole('listitem')).toHaveCount(5);
    await expect(list.getByRole('heading', { level: 2 })).toHaveText([
      'App Development',
      'Web Development',
      'Open Source',
      'Programming Teaching',
      'Blog Writing',
    ]);
    const items = list.getByRole('listitem');
    await expect(items.nth(0)).toContainText('I build Android and iOS apps');
    await expect(items.nth(4)).toContainText('I write technical articles');
    // the art of each service is a different icon
    const icons = await items.evaluateAll((els) =>
      els.map(
        (el) => el.querySelector('svg.lucide')?.getAttribute('class') ?? '',
      ),
    );
    expect(new Set(icons).size).toBe(5);
    expect(icons[0]).toContain('smartphone');
    expect(icons[1]).toContain('globe');
  });

  test('the tours are the topic chips: a Topic group of buttons named by the service', async ({
    page,
  }) => {
    await gotoSkin(page, '/services');
    await expect(topics(page)).toHaveCount(5);
    await expect(topics(page).first()).toHaveAttribute(
      'aria-label',
      'App Development',
    );
    await expect(topics(page).first()).toHaveAttribute('aria-pressed', 'false');
  });

  test('a tour writes the starting text and keeps what was typed', async ({
    page,
  }) => {
    await gotoSkin(page, '/services');
    const message = page.getByLabel('Message', { exact: true });
    const app = page.getByRole('button', { name: 'App Development' });
    const web = page.getByRole('button', { name: 'Web Development' });

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

  test('a skeleton shows while the services load, then the tours', async ({
    page,
  }) => {
    await interceptCollection(page, 'services', { delay: 1500 });
    await gotoSkin(page, '/services');
    const loading = page.getByRole('status', { name: 'Loading' }).first();
    await expect(loading).toBeVisible();
    await expect(loading).toHaveAttribute('aria-busy', 'true');
    await expect(topics(page)).toHaveCount(5, { timeout: 15_000 });
  });

  test('says there is nothing to show yet, and the booking form stays', async ({
    page,
  }) => {
    await interceptCollection(page, 'services', 'empty');
    await gotoSkin(page, '/services');
    await expect(
      page.getByRole('heading', { name: 'No services to show yet' }),
    ).toBeVisible();
    await expect(page.getByLabel('Message', { exact: true })).toBeVisible();
  });

  test('says it could not load, and Try again loads the tours', async ({
    page,
  }) => {
    await interceptCollection(page, 'services', 'error');
    await gotoSkin(page, '/services');
    const alert = page
      .getByRole('alert')
      .filter({ hasText: "couldn't be loaded" });
    await expect(alert).toBeVisible({ timeout: 20_000 });
    await expect(
      alert.getByRole('heading', { name: "Services couldn't be loaded" }),
    ).toBeVisible();
    await page.unroute('**/firestore.googleapis.com/**');
    await mockFirestore(page);
    await alert.getByRole('button', { name: 'Try again' }).click();
    await expect(topics(page)).toHaveCount(5, { timeout: 15_000 });
  });

  test('a page switched to soon shows Coming soon', async ({ page }) => {
    await mockFirestore(page, { 'site/live': { pages: { services: 'soon' } } });
    await gotoSkin(page, '/services');
    await expect(
      page.getByRole('heading', { name: 'This page is coming soon.' }),
    ).toBeVisible();
  });
});

test.describe('the booking form', () => {
  test('validation sets aria-invalid, announces and focuses the first problem', async ({
    page,
  }) => {
    await gotoSkin(page, '/services');
    await page.getByRole('button', { name: 'Send' }).click();
    await expect(page.getByLabel('Name')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    await expect(page.getByLabel('Email')).toHaveAttribute(
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
    await expect(page.getByLabel('Name')).toHaveAttribute(
      'aria-describedby',
      'f-name-error',
    );
    await expect(liveRegion(page)).toHaveText(
      '3 fields need attention: Name, Email, Message',
    );
    await page.getByLabel('Name').fill('Ada');
    await expect(page.getByLabel('Name')).toHaveAttribute(
      'aria-invalid',
      'false',
    );
    await expect(page.getByText('Name is required')).toHaveCount(0);
  });

  test('a message with only the starting sentence asks for details', async ({
    page,
  }) => {
    await gotoSkin(page, '/services');
    await page.getByLabel('Name').fill('Ada');
    await page.getByLabel('Email').fill('ada@example.com');
    await page.getByRole('button', { name: 'Open Source' }).click();
    await page.getByRole('button', { name: 'Send' }).click();
    await expect(
      page.getByText('Add a few details about what you need'),
    ).toBeVisible();
  });

  test('the Send button shows a spinner and is disabled while sending', async ({
    page,
  }) => {
    await gotoSkin(page, '/services?form=error');
    await fill(page);
    await page.getByRole('button', { name: 'Send' }).click();
    const sending = page.getByRole('button', { name: /Sending/ });
    await expect(sending).toBeDisabled();
    await expect(page.locator('form[aria-busy="true"]')).toBeVisible();
  });

  test('the counter warns near the limit and stops at it', async ({ page }) => {
    await gotoSkin(page, '/services');
    const message = page.getByLabel('Message', { exact: true });
    await message.fill('x'.repeat(899));
    await expect(page.getByText('899/1000')).not.toHaveClass(/text-tl-danger/);
    await message.fill('x'.repeat(900));
    await expect(page.getByText('900/1000')).toHaveClass(/text-tl-danger/);
    await message.pressSequentially('y'.repeat(150));
    await expect(page.getByText('Limit reached, 1000/1000')).toBeVisible();
  });

  test('the limits come from site/settings', async ({ page }) => {
    await mockFirestore(page, {
      'site/settings': { contactForm: { nameMax: 12, messageMax: 60 } },
    });
    await gotoSkin(page, '/services');
    await expect(page.getByLabel('Name')).toHaveAttribute('maxlength', '12');
    await expect(page.getByLabel('Message', { exact: true })).toHaveAttribute(
      'maxlength',
      '60',
    );
    await expect(page.getByText('0/60')).toBeVisible();
  });

  test('a message is written to Firestore and the booked state shows', async ({
    page,
  }) => {
    const writes: string[] = [];
    page.on('request', (r) => {
      if (r.url().includes(':commit')) writes.push(r.postData() ?? '');
    });
    await gotoSkin(page, '/services');
    await page.getByRole('button', { name: 'Web Development' }).click();
    await fill(page);
    await page.getByRole('button', { name: 'Send' }).click();

    const done = page.getByRole('heading', { name: 'Message sent' });
    await expect(done).toBeVisible();
    await expect(done).toBeFocused();
    await expect(page.getByText('Booked', { exact: true })).toBeVisible();
    await expect(
      page.getByText("Thanks, Ada Lovelace. I'll reply to ada@example.com."),
    ).toBeVisible();
    expect(writes).toHaveLength(1);
    expect(writes[0]).toContain('ada@example.com');
    expect(writes[0]).toContain('messages');
    await expect(liveRegion(page)).toHaveText(
      'Message sent. I will reply to ada@example.com',
    );

    await page.getByRole('button', { name: 'Send another message' }).click();
    await expect(page.getByLabel('Name')).toBeFocused();
    await expect(page.getByLabel('Name')).toHaveValue('');
    await expect(
      page.getByRole('button', { name: 'Web Development' }),
    ).toHaveAttribute('aria-pressed', 'false');
  });

  test('after the message is saved the Worker is asked to email it to the owner', async ({
    page,
  }) => {
    const received = await mockNotify(page);
    await gotoSkin(page, '/services');
    await page.getByRole('button', { name: 'Web Development' }).click();
    await fill(page);
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
    expect(String(received[0].message)).toContain('I need an app.');
  });

  test('the visitor still sees Message sent when the email notification fails', async ({
    page,
  }) => {
    await mockNotify(page, 502);
    await gotoSkin(page, '/services');
    await fill(page);
    await page.getByRole('button', { name: 'Send' }).click();
    await expect(
      page.getByRole('heading', { name: 'Message sent' }),
    ).toBeVisible();
  });

  test('a failed send keeps the text, offers Try again and no email is requested', async ({
    page,
  }) => {
    const received = await mockNotify(page);
    await page.route('**/firestore.googleapis.com/**:commit*', (route) =>
      route.abort('failed'),
    );
    await gotoSkin(page, '/services');
    await fill(page);
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

  test('Try again after a failure sends the same message', async ({ page }) => {
    let failures = 1;
    const writes: string[] = [];
    await page.route('**/firestore.googleapis.com/**:commit*', (route) => {
      if (failures-- > 0) return route.abort('failed');
      writes.push(route.request().postData() ?? '');
      return route.fallback();
    });
    await gotoSkin(page, '/services');
    await fill(page);
    await page.getByRole('button', { name: 'Send' }).click();
    await page.getByRole('button', { name: 'Try again' }).click();
    await expect(
      page.getByRole('heading', { name: 'Message sent' }),
    ).toBeVisible();
    expect(writes).toHaveLength(1);
    expect(writes[0]).toContain('I need an app.');
  });

  test('?form=error forces the failure state for design review', async ({
    page,
  }) => {
    await gotoSkin(page, '/services?form=error');
    await fill(page);
    await page.getByRole('button', { name: 'Send' }).click();
    await expect(
      page.getByRole('alert').filter({ hasText: "Couldn't send" }),
    ).toBeVisible();
  });

  test('a filled honeypot pretends success and sends nothing', async ({
    page,
  }) => {
    let writes = 0;
    page.on('request', (r) => {
      if (r.url().includes(':commit')) writes++;
    });
    await gotoSkin(page, '/services');
    await fill(page);
    await page
      .locator('input[name="website"]')
      .fill('http://spam.example', { force: true });
    await page.getByRole('button', { name: 'Send' }).click();
    await expect(
      page.getByRole('heading', { name: 'Message sent' }),
    ).toBeVisible();
    expect(writes).toBe(0);
  });

  test('the honeypot is not reachable with the keyboard', async ({ page }) => {
    await gotoSkin(page, '/services');
    await expect(page.locator('input[name="website"]')).toHaveAttribute(
      'tabindex',
      '-1',
    );
    await expect(page.locator('input[name="website"]')).not.toBeInViewport();
  });

  test('the keyboard goes from the tours to the form fields and the Send button', async ({
    page,
  }) => {
    await gotoSkin(page, '/services');
    await page.getByRole('button', { name: 'Blog Writing' }).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByLabel('Message', { exact: true })).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(page.getByLabel('Email')).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(page.getByLabel('Name')).toBeFocused();
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Send' })).toBeFocused();
  });
});

test.describe('the switches of site/live', () => {
  test('the form is replaced by a note and the tours are plain cards when it is off', async ({
    page,
  }) => {
    await mockFirestore(page, {
      'site/live': { features: { contactForm: false } },
    });
    await gotoSkin(page, '/services');
    await expect(
      page.getByText('The contact form is taking a break.'),
    ).toBeVisible();
    await expect(
      page.getByText('Use the Connect menu at the top of the page'),
    ).toBeVisible();
    await expect(page.getByLabel('Message', { exact: true })).toHaveCount(0);
    await expect(page.getByRole('group', { name: 'Topic' })).toHaveCount(0);
    await expect(
      page.getByRole('heading', { name: 'App Development', level: 2 }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'App Development' }),
    ).toHaveCount(0);
  });

  test('Ask BB Bot is offered when the chat is on and left out when it is off', async ({
    page,
  }) => {
    await gotoSkin(page, '/services');
    const section = page.locator('#contact-cta');
    await expect(section.getByText('Not sure where to start?')).toBeVisible();
    await expect(
      section.getByRole('button', { name: 'Ask BB Bot' }),
    ).toBeVisible();

    await mockFirestore(page, { 'site/live': { features: { chat: false } } });
    await gotoSkin(page, '/services');
    await expect(
      page.locator('#contact-cta').getByRole('button', { name: 'Ask BB Bot' }),
    ).toHaveCount(0);
  });
});

test.describe('layout', () => {
  for (const width of [360, 390]) {
    test(`at ${width} px nothing scrolls sideways`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await gotoSkin(page, '/services');
      await expect(topics(page)).toHaveCount(5);
      const overflow = await page.evaluate(() => {
        const panel = document.querySelector('.tl-panel > div');
        return {
          page: document.documentElement.scrollWidth - window.innerWidth,
          panel: panel ? panel.scrollWidth - panel.clientWidth : 0,
        };
      });
      expect(overflow.page).toBeLessThanOrEqual(0);
      expect(overflow.panel).toBeLessThanOrEqual(0);
    });
  }

  test('on a wide screen the tours and the form are a card at the right of the map', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await gotoSkin(page, '/services');
    const panel = await page.locator('.tl-panel').boundingBox();
    expect(panel!.x).toBeGreaterThan(800);
    expect(panel!.width).toBeLessThanOrEqual(440);
  });

  test('the fields have a visible edge in both themes', async ({ page }) => {
    await page.addInitScript(() =>
      localStorage.setItem('bach-cv-theme', 'dark'),
    );
    await gotoSkin(page, '/services');
    const border = await page
      .getByLabel('Name')
      .evaluate((el) => getComputedStyle(el).borderTopColor);
    expect(border).not.toBe('rgba(0, 0, 0, 0)');
  });
});

test.describe('on a touch screen', () => {
  test.use({ hasTouch: true, isMobile: true });

  test('the tours, the Send button and the links are at least 44 px tall', async ({
    page,
  }) => {
    await gotoSkin(page, '/services');
    await expect(topics(page)).toHaveCount(5);
    await animationsSettled(page);
    const heights = async (selector: string) =>
      page
        .locator(selector)
        .evaluateAll((els) =>
          els.map((el) => Math.round(el.getBoundingClientRect().height)),
        );
    for (const height of await heights('[aria-label="Topic"] button'))
      expect(height).toBeGreaterThanOrEqual(44);
    for (const height of await heights('#contact-cta button'))
      expect(height).toBeGreaterThanOrEqual(44);
  });
});

test.describe('in Vietnamese', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
  });

  test('shows the page, validation and the booked state in Vietnamese', async ({
    page,
  }) => {
    const writes: string[] = [];
    page.on('request', (r) => {
      if (r.url().includes(':commit')) writes.push(r.postData() ?? '');
    });
    await gotoSkin(page, '/services');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Dịch vụ');
    await expect(page.getByText('Các tour bạn có thể đặt')).toBeVisible();
    await expect(
      page.getByText('Phiếu đặt chỗ', { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Bạn muốn xây dựng điều gì?' }),
    ).toBeVisible();
    await expect(
      page.getByRole('group', { name: 'Chủ đề' }).getByRole('button'),
    ).toHaveCount(5);
    await expect(page.getByRole('list', { name: 'Dịch vụ' })).toBeVisible();

    await page.getByRole('button', { name: 'Gửi' }).click();
    await expect(page.getByText('Vui lòng nhập tên')).toBeVisible();
    await expect(
      page.getByText('Nhập email hợp lệ để mình có thể trả lời bạn'),
    ).toBeVisible();
    await expect(page.getByText('Vui lòng nhập tin nhắn')).toBeVisible();
    await expect(liveRegion(page)).toHaveText(
      '3 trường cần chú ý: Tên, Email, Tin nhắn',
    );

    await page.getByLabel('Tên').fill('Ada');
    await page.getByLabel('Email').fill('ada@example.com');
    await page.getByLabel('Tin nhắn').fill('Mình cần một ứng dụng.');
    await page.getByRole('button', { name: 'Gửi' }).click();
    await expect(
      page.getByRole('heading', { name: 'Đã gửi tin nhắn' }),
    ).toBeVisible();
    await expect(page.getByText('Đã đặt chỗ', { exact: true })).toBeVisible();
    await expect(
      page.getByText('Cảm ơn Ada. Mình sẽ trả lời bạn qua ada@example.com.'),
    ).toBeVisible();
    expect(writes).toHaveLength(1);
    expect(writes[0]).toContain('"vi"');
  });

  test('shows the failure state in Vietnamese', async ({ page }) => {
    await gotoSkin(page, '/services?form=error');
    await page.getByLabel('Tên').fill('Ada');
    await page.getByLabel('Email').fill('ada@example.com');
    await page.getByLabel('Tin nhắn').fill('Xin chào');
    await page.getByRole('button', { name: 'Gửi' }).click();
    await expect(page.getByText('Không gửi được tin nhắn.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Thử lại' })).toBeFocused();
  });
});
