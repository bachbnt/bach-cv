/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test, type Page } from '@playwright/test';
import { mockFirestore } from '../support/firestore-mock';
import { gotoSkin, useSkin } from '../support/skin';
import { mockNotify } from '../support/worker';

test.beforeEach(async ({ page }) => {
  await mockFirestore(page);
  await useSkin(page, 'moba');
});

const fill = async (page: Page) => {
  await page.getByLabel('Name').fill('Ada Lovelace');
  await page.getByLabel('Email').fill('ada@example.com');
  await page.getByLabel('Message', { exact: true }).fill('I need an app.');
};

const desk = (page: Page) => page.locator('#contact-cta');
const liveRegion = (page: Page) => desk(page).locator('[role="status"]');
const message = (page: Page) => page.getByLabel('Message', { exact: true });

/** Answers the reads of the `services` collection with an empty list or a server error. */
async function intercept(page: Page, answer: 'empty' | 'error') {
  await page.route('**/firestore.googleapis.com/**', (route) => {
    const request = route.request();
    const mine =
      request.url().includes(':runQuery') &&
      (request.postData() ?? '').includes('"collectionId":"services"');
    if (!mine) return route.fallback();
    return answer === 'error'
      ? route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: '{"error":{"code":500,"status":"INTERNAL"}}',
        })
      : route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([{ readTime: '2026-01-01T00:00:00Z' }]),
        });
  });
}

test.describe('the shop', () => {
  test('lists every service with its name and description, the title and the intro', async ({
    page,
  }) => {
    await gotoSkin(page, '/services');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Services',
    );
    await expect(
      page.getByText('What I can do for your team or project.'),
    ).toBeVisible();
    const items = page
      .getByRole('list', { name: 'Services' })
      .getByRole('listitem');
    await expect(items).toHaveCount(5);
    await expect(
      page.getByRole('heading', { name: 'App Development', level: 2 }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Blog Writing', level: 2 }),
    ).toBeVisible();
    await expect(items.first()).toContainText('I build Android and iOS apps');
  });

  test('every kind of service draws its own emblem', async ({ page }) => {
    await gotoSkin(page, '/services');
    const arts = await page
      .locator('[data-art]')
      .evaluateAll((els) => els.map((e) => e.getAttribute('data-art')));
    expect(new Set(arts).size).toBeGreaterThanOrEqual(5);
    // decoration only: nothing in an emblem is read out
    await expect(
      page.locator('[data-art][aria-hidden="true"]').first(),
    ).toBeAttached();
  });

  test('the Choose this topic button of an item picks the topic like its chip', async ({
    page,
  }) => {
    await gotoSkin(page, '/services');
    const item = page
      .getByRole('list', { name: 'Services' })
      .getByRole('listitem')
      .nth(1);
    const choose = item.getByRole('button', { name: 'Choose this topic' });
    await choose.click();
    await expect(choose).toHaveAttribute('aria-pressed', 'true');
    await expect(
      page.getByRole('button', { name: 'Web Development', exact: true }),
    ).toHaveAttribute('aria-pressed', 'true');
    await expect(message(page)).toHaveValue(
      /^Hi Bach, I'd like a website or web app built/,
    );
    await expect(message(page)).toBeFocused();
    await choose.click();
    await expect(choose).toHaveAttribute('aria-pressed', 'false');
    await expect(message(page)).toHaveValue('');
  });

  test('shows a loading screen while the services are on their way', async ({
    page,
  }) => {
    await page.route('**/firestore.googleapis.com/**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      return route.fallback();
    });
    await gotoSkin(page, '/services');
    const loading = page
      .getByRole('region', { name: 'Services' })
      .getByRole('status', { name: 'Loading' });
    await expect(loading).toBeVisible();
    await expect(loading).toHaveAttribute('aria-busy', 'true');
    await expect(
      page.getByRole('heading', { name: 'App Development', level: 2 }),
    ).toBeVisible({ timeout: 15_000 });
  });

  test('says there are no services, and the form is still there', async ({
    page,
  }) => {
    await intercept(page, 'empty');
    await gotoSkin(page, '/services');
    await expect(
      page.getByRole('heading', { name: 'No services to show yet' }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Tell me about your project' }),
    ).toHaveAttribute('href', '#contact-cta');
    await expect(page.getByRole('group', { name: 'Topic' })).toHaveCount(0);
    await expect(message(page)).toBeVisible();
  });

  test('says the services could not load and Try again brings them back', async ({
    page,
  }) => {
    await intercept(page, 'error');
    await gotoSkin(page, '/services');
    await expect(
      page.getByRole('heading', { name: "Services couldn't be loaded" }),
    ).toBeVisible();
    await page.unroute('**/firestore.googleapis.com/**');
    await mockFirestore(page);
    await page.getByRole('button', { name: 'Try again' }).click();
    await expect(
      page.getByRole('heading', { name: 'App Development', level: 2 }),
    ).toBeVisible();
  });
});

test.describe('the order desk', () => {
  test('has the heading, the hint, the topic chips from the services and the Ask BB Bot button', async ({
    page,
  }) => {
    await gotoSkin(page, '/services');
    await expect(
      page.getByRole('heading', { name: 'What do you want to build?' }),
    ).toBeVisible();
    await expect(
      page.getByText(
        "Pick a topic and I'll start the message for you, or write your own.",
      ),
    ).toBeVisible();
    const chips = page
      .getByRole('group', { name: 'Topic' })
      .getByRole('button');
    await expect(chips).toHaveCount(5);
    await expect(chips.first()).toHaveText('App Development');
    await expect(
      desk(page).getByRole('button', { name: 'Ask BB Bot' }),
    ).toBeVisible();
  });

  test('Ask BB Bot opens the chat', async ({ page }) => {
    await gotoSkin(page, '/services');
    await desk(page).getByRole('button', { name: 'Ask BB Bot' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('a topic chip writes the starting text and keeps what was typed', async ({
    page,
  }) => {
    await gotoSkin(page, '/services');
    const app = page
      .getByRole('group', { name: 'Topic' })
      .getByRole('button', { name: 'App Development' });
    const web = page
      .getByRole('group', { name: 'Topic' })
      .getByRole('button', { name: 'Web Development' });
    await app.click();
    await expect(app).toHaveAttribute('aria-pressed', 'true');
    await expect(message(page)).toHaveValue(
      /^Hi Bach, I'm looking for help with a mobile app/,
    );
    await expect(message(page)).toBeFocused();
    await message(page).pressSequentially('a delivery app');
    await web.click();
    await expect(app).toHaveAttribute('aria-pressed', 'false');
    await expect(message(page)).toHaveValue(
      /^Hi Bach, I'd like a website or web app built\. What I have in mind: a delivery app$/,
    );
    await web.click();
    await expect(message(page)).toHaveValue('a delivery app');
  });

  test('validation shows every message, announces, focuses the first problem and clears as it is fixed', async ({
    page,
  }) => {
    await gotoSkin(page, '/services');
    await page.getByRole('button', { name: 'Send' }).click();
    await expect(page.getByLabel('Name')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    await expect(desk(page).locator('[aria-invalid="true"]')).toHaveCount(3);
    await expect(page.getByLabel('Name')).toBeFocused();
    await expect(page.getByText('Name is required')).toBeVisible();
    await expect(
      page.getByText('Enter a valid email so I can reply'),
    ).toBeVisible();
    await expect(page.getByText('Message is required')).toBeVisible();
    await expect(liveRegion(page)).toHaveText(
      '3 fields need attention: Name, Email, Message',
    );
    await page.getByLabel('Name').fill('Ada');
    await expect(page.getByLabel('Name')).toHaveAttribute(
      'aria-invalid',
      'false',
    );
    await expect(desk(page).locator('[aria-invalid="true"]')).toHaveCount(2);
  });

  test('a message with only the starter sentence asks for details', async ({
    page,
  }) => {
    await gotoSkin(page, '/services');
    await page.getByLabel('Name').fill('Ada');
    await page.getByLabel('Email').fill('ada@example.com');
    await page
      .getByRole('group', { name: 'Topic' })
      .getByRole('button', { name: 'Open Source' })
      .click();
    await page.getByRole('button', { name: 'Send' }).click();
    await expect(
      page.getByText('Add a few details about what you need'),
    ).toBeVisible();
    await expect(liveRegion(page)).toHaveText(
      '1 field needs attention: Message',
    );
    await expect(message(page)).toBeFocused();
  });

  test('the fields stop at the limits of the settings', async ({ page }) => {
    await gotoSkin(page, '/services');
    // the field stops typing at the limit, so a pasted value over it cannot reach the form: the limit is the field's maxLength
    await expect(page.getByLabel('Name')).toHaveAttribute('maxlength', '100');
    await expect(message(page)).toHaveAttribute('maxlength', '1000');
  });

  test('the counter warns near the limit and stops at it', async ({ page }) => {
    await gotoSkin(page, '/services');
    await message(page).fill('x'.repeat(899));
    await expect(page.getByText('899/1000')).not.toHaveClass(/text-mb-red-ink/);
    await message(page).fill('x'.repeat(900));
    await expect(page.getByText('900/1000')).toHaveClass(/text-mb-red-ink/);
    await message(page).pressSequentially('y'.repeat(150));
    await expect(page.getByText('Limit reached, 1000/1000')).toBeVisible();
  });

  test('the Send button shows a spinner and is disabled while sending', async ({
    page,
  }) => {
    await gotoSkin(page, '/services?form=error');
    await fill(page);
    await page.getByRole('button', { name: 'Send' }).click();
    const sending = page.getByRole('button', { name: /Sending/ });
    await expect(sending).toBeDisabled();
    await expect(sending.getByTestId('mb-spinner')).toBeVisible();
    await expect(liveRegion(page)).toHaveText('Sending your message');
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
      .getByRole('group', { name: 'Topic' })
      .getByRole('button', { name: 'Web Development' })
      .click();
    await fill(page);
    await page.getByRole('button', { name: 'Send' }).click();
    const done = page.getByRole('heading', { name: 'Message sent' });
    await expect(done).toBeVisible();
    await expect(done).toBeFocused();
    await expect(
      page.getByText("Thanks, Ada Lovelace. I'll reply to ada@example.com."),
    ).toBeVisible();
    await expect(liveRegion(page)).toHaveText(
      'Message sent. I will reply to ada@example.com',
    );
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
      .getByRole('group', { name: 'Topic' })
      .getByRole('button', { name: 'Web Development' })
      .click();
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

  test('no email is requested and the text is kept when the message could not be saved', async ({
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
    await expect(message(page)).toHaveValue('I need an app.');
    await expect(page.getByRole('button', { name: 'Try again' })).toBeFocused();
    await expect(liveRegion(page)).toHaveText(
      'Message not sent. Check your connection and try again.',
    );
    expect(received).toHaveLength(0);
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

  test('the form can be filled and sent with the keyboard alone', async ({
    page,
  }) => {
    await gotoSkin(page, '/services');
    await page.getByLabel('Name').focus();
    await page.keyboard.type('Ada');
    await page.keyboard.press('Tab');
    await page.keyboard.type('ada@example.com');
    await page.keyboard.press('Tab');
    await page.keyboard.type('I need an app.');
    await page.keyboard.press('Tab');
    // the honeypot is out of the tab order: the next stop is Send
    await expect(page.getByRole('button', { name: 'Send' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(
      page.getByRole('heading', { name: 'Message sent' }),
    ).toBeVisible();
  });

  test('the form is replaced by a note when site/live turns it off, and the shop has no choose buttons', async ({
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
    await expect(message(page)).toHaveCount(0);
    await expect(page.getByRole('group', { name: 'Topic' })).toHaveCount(0);
    await expect(
      page.getByRole('button', { name: 'Choose this topic' }),
    ).toHaveCount(0);
    await expect(
      page.getByRole('heading', { name: 'App Development', level: 2 }),
    ).toBeVisible();
  });

  test('Ask BB Bot is left out when the chat is off', async ({ page }) => {
    await mockFirestore(page, { 'site/live': { features: { chat: false } } });
    await gotoSkin(page, '/services');
    await expect(message(page)).toBeVisible();
    await expect(
      desk(page).getByRole('button', { name: 'Ask BB Bot' }),
    ).toHaveCount(0);
  });
});

test.describe('the page switch', () => {
  test('soon shows the locked screen', async ({ page }) => {
    await mockFirestore(page, { 'site/live': { pages: { services: 'soon' } } });
    await gotoSkin(page, '/services');
    await expect(page.getByText('This page is coming soon.')).toBeVisible();
    await expect(message(page)).toHaveCount(0);
  });

  test('hidden shows the not found screen', async ({ page }) => {
    await mockFirestore(page, {
      'site/live': { pages: { services: 'hidden' } },
    });
    await gotoSkin(page, '/services');
    await expect(page.getByText("This page doesn't exist.")).toBeVisible();
  });
});

test.describe('on a phone', () => {
  test.use({ viewport: { width: 360, height: 800 } });

  test('nothing scrolls sideways and the buttons are big enough', async ({
    page,
  }) => {
    await gotoSkin(page, '/services');
    await expect(
      page.getByRole('heading', { name: 'App Development', level: 2 }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    const wide = await page.evaluate(
      () =>
        [
          ...document.querySelectorAll<HTMLElement>(
            '#contact-cta, #contact-cta *',
          ),
        ].filter((e) => e.getBoundingClientRect().right > window.innerWidth + 1)
          .length,
    );
    expect(wide).toBe(0);
    const send = page.getByRole('button', { name: 'Send' });
    await send.scrollIntoViewIfNeeded();
    expect((await send.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(44);
  });
});

test.describe('in Vietnamese', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
  });

  test('shows the page, validation and the success state in Vietnamese', async ({
    page,
  }) => {
    const writes: string[] = [];
    page.on('request', (r) => {
      if (r.url().includes(':commit')) writes.push(r.postData() ?? '');
    });
    await gotoSkin(page, '/services');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Dịch vụ');
    await expect(
      page.getByRole('heading', { name: 'Bạn muốn xây dựng điều gì?' }),
    ).toBeVisible();
    await expect(
      page.getByRole('group', { name: 'Chủ đề' }).getByRole('button'),
    ).toHaveCount(5);
    await expect(
      page.getByRole('button', { name: 'Chọn chủ đề này' }),
    ).toHaveCount(5);
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
    await expect(
      page.getByText('Cảm ơn Ada. Mình sẽ trả lời bạn qua ada@example.com.'),
    ).toBeVisible();
    expect(writes).toHaveLength(1);
    expect(writes[0]).toContain('"vi"');
  });

  test('shows the failure state and the Ask BB Bot button in Vietnamese', async ({
    page,
  }) => {
    await gotoSkin(page, '/services?form=error');
    await expect(
      desk(page).getByRole('button', { name: 'Hỏi BB Bot' }),
    ).toBeVisible();
    await page.getByLabel('Tên').fill('Ada');
    await page.getByLabel('Email').fill('ada@example.com');
    await page.getByLabel('Tin nhắn').fill('Xin chào');
    await page.getByRole('button', { name: 'Gửi' }).click();
    await expect(page.getByText('Không gửi được tin nhắn.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Thử lại' })).toBeFocused();
  });
});
