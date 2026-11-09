/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test, type Page } from '@playwright/test';
import { mockFirestore } from '../support/firestore-mock';
import { gotoSkin, useSkin } from '../support/skin';
import { mockNotify } from '../support/worker';

test.beforeEach(async ({ page }) => {
  await mockFirestore(page);
  await useSkin(page, 'academic');
});

const fill = async (page: Page) => {
  await page.getByLabel('Name').fill('Ada Lovelace');
  await page.getByLabel('Email').fill('ada@example.com');
  await page.getByLabel('Message', { exact: true }).fill('I need an app.');
};

const liveRegion = (page: Page) => page.locator('#contact-cta [role="status"]');

test.describe('the proposal', () => {
  test('lists the services as work packages with the topic chips of the form', async ({
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
    await expect(
      page.getByText('work packages', { exact: true }),
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
    // pressed again it does not toggle the topic off the way its chip does
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

  test('has no horizontal scroll on a phone', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoSkin(page, '/services');
    await expect(
      page.getByRole('heading', { name: 'App Development', level: 2 }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  });
});

test.describe('the contact form', () => {
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
    await expect(page.getByText('899/1000')).not.toHaveClass(/text-ac-accent/);
    await message.fill('x'.repeat(900));
    await expect(page.getByText('900/1000')).toHaveClass(/text-ac-accent/);
    await message.pressSequentially('y'.repeat(150));
    await expect(page.getByText('Limit reached, 1000/1000')).toBeVisible();
  });

  test('the Send pen shows a spinner and is disabled while sending', async ({
    page,
  }) => {
    await gotoSkin(page, '/services?form=error');
    await fill(page);
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
    // choosing a topic moves the focus to the message on the next frame: wait for it, or the typing of the next field can land there
    await expect(page.getByLabel('Message', { exact: true })).toBeFocused();
    await fill(page);
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
  });

  test('a failed send keeps the text and offers another try', async ({
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
    // no email is asked for when the message could not be saved
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

  test('"Ask BB Bot" opens the chat, and is gone when the chat is off', async ({
    page,
  }) => {
    await gotoSkin(page, '/services');
    await expect(
      page.locator('#contact-cta').getByRole('button', { name: 'Ask BB Bot' }),
    ).toBeVisible();

    await page.unroute('**/firestore.googleapis.com/**');
    await mockFirestore(page, { 'site/live': { features: { chat: false } } });
    await gotoSkin(page, '/services');
    await expect(
      page.locator('#contact-cta').getByRole('button', { name: 'Ask BB Bot' }),
    ).toHaveCount(0);
  });
});

test.describe('the states of the page', () => {
  test('says it could not load the services, and Try again loads them', async ({
    page,
  }) => {
    await page.route('**/firestore.googleapis.com/**', (route) => {
      const request = route.request();
      const mine =
        request.url().includes(':runQuery') &&
        (request.postData() ?? '').includes('"collectionId":"services"');
      return mine
        ? route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: '{"error":{"code":500,"status":"INTERNAL"}}',
          })
        : route.fallback();
    });
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

  test('a page that is coming soon says so', async ({ page }) => {
    await page.unroute('**/firestore.googleapis.com/**');
    await mockFirestore(page, {
      'site/live': { pages: { services: 'soon' } },
    });
    await gotoSkin(page, '/services');
    await expect(
      page.getByRole('heading', { name: 'This page is coming soon.' }),
    ).toBeVisible();
  });
});

test.describe('in Vietnamese', () => {
  test('shows the page, validation and the success state in Vietnamese', async ({
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
    await expect(page.getByText('gói việc', { exact: true })).toBeVisible();
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
