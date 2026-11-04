/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test, type Page } from '@playwright/test';
import { mockFirestore } from './support/firestore-mock';

test.beforeEach(async ({ page }) => {
  await mockFirestore(page);
});

const fill = async (page: Page) => {
  await page.getByLabel('Name').fill('Ada Lovelace');
  await page.getByLabel('Email').fill('ada@example.com');
  await page.getByLabel('Message').fill('I need an app.');
};

test('the page lists the services and topic chips from Firestore', async ({
  page,
}) => {
  await page.goto('/services');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Services');
  await expect(
    page.getByRole('heading', { name: 'App Development', level: 2 }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Blog Writing', level: 2 }),
  ).toBeVisible();
  const chips = page.getByRole('group', { name: 'Topic' }).getByRole('button');
  await expect(chips).toHaveCount(5);
  await expect(chips.first()).toHaveText('App Development');
});

test('a topic chip writes the starting text and keeps what was typed', async ({
  page,
}) => {
  await page.goto('/services');
  const message = page.getByLabel('Message');
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

test('validation sets aria-invalid, announces and focuses the first problem', async ({
  page,
}) => {
  await page.goto('/services');
  await page.getByRole('button', { name: 'Send' }).click();
  await expect(page.getByLabel('Name')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByLabel('Name')).toBeFocused();
  await expect(page.getByText('Name is required')).toBeVisible();
  await expect(
    page.getByText('Enter a valid email so I can reply'),
  ).toBeVisible();
  await expect(page.getByText('Message is required')).toBeVisible();
  await expect(page.getByRole('status')).toHaveText(
    '3 fields need attention: Name, Email, Message',
  );
  await page.getByLabel('Name').fill('Ada');
  await expect(page.getByLabel('Name')).toHaveAttribute(
    'aria-invalid',
    'false',
  );
});

test('the counter warns near the limit and stops at it', async ({ page }) => {
  await page.goto('/services');
  const message = page.getByLabel('Message');
  await message.fill('x'.repeat(899));
  await expect(page.getByText('899/1000')).not.toHaveClass(/font-semibold/);
  await message.fill('x'.repeat(900));
  await expect(page.getByText('900/1000')).toHaveClass(/font-semibold/);
  await message.pressSequentially('y'.repeat(150));
  await expect(page.getByText('Limit reached, 1000/1000')).toBeVisible();
});

test('a message is written to Firestore and the success state shows', async ({
  page,
}) => {
  const writes: string[] = [];
  page.on('request', (r) => {
    if (r.url().includes(':commit')) writes.push(r.postData() ?? '');
  });
  await page.goto('/services');
  await page.getByRole('button', { name: 'Web Development' }).click();
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

test('a failed send keeps the text and offers another try', async ({
  page,
}) => {
  await page.route('**/firestore.googleapis.com/**:commit*', (route) =>
    route.abort('failed'),
  );
  await page.goto('/services');
  await fill(page);
  await page.getByRole('button', { name: 'Send' }).click();
  await expect(
    page.getByRole('alert').filter({ hasText: "Couldn't send" }),
  ).toContainText("Couldn't send your message");
  await expect(page.getByLabel('Message')).toHaveValue('I need an app.');
  await expect(page.getByRole('button', { name: 'Try again' })).toBeFocused();
});

test('?form=error forces the failure state for design review', async ({
  page,
}) => {
  await page.goto('/services?form=error');
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
  await page.goto('/services');
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

test('the form is replaced by a note when site/live turns it off', async ({
  page,
}) => {
  await mockFirestore(page, {
    'site/live': { features: { contactForm: false } },
  });
  await page.goto('/services');
  await expect(
    page.getByText('The contact form is taking a break.'),
  ).toBeVisible();
  await expect(page.getByLabel('Message')).toHaveCount(0);
});

test('there is no horizontal scroll on a phone', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/services');
  await expect(
    page.getByRole('heading', { name: 'App Development', level: 2 }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
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
    await page.goto('/services');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Dịch vụ');
    await expect(
      page.getByRole('heading', { name: 'Bạn muốn xây dựng điều gì?' }),
    ).toBeVisible();
    await expect(
      page.getByRole('group', { name: 'Chủ đề' }).getByRole('button'),
    ).toHaveCount(5);

    await page.getByRole('button', { name: 'Gửi', exact: true }).click();
    await expect(page.getByText('Vui lòng nhập tên')).toBeVisible();
    await expect(
      page.getByText('Nhập email hợp lệ để mình có thể trả lời bạn'),
    ).toBeVisible();
    await expect(page.getByText('Vui lòng nhập tin nhắn')).toBeVisible();
    await expect(page.getByRole('status')).toHaveText(
      '3 trường cần chú ý: Tên, Email, Tin nhắn',
    );

    await page.getByLabel('Tên').fill('Ada');
    await page.getByLabel('Email').fill('ada@example.com');
    await page.getByLabel('Tin nhắn').fill('Mình cần một ứng dụng.');
    await page.getByRole('button', { name: 'Gửi', exact: true }).click();
    await expect(
      page.getByRole('heading', { name: 'Đã gửi tin nhắn' }),
    ).toBeVisible();
    await expect(
      page.getByText('Cảm ơn Ada. Mình sẽ trả lời bạn qua ada@example.com.'),
    ).toBeVisible();
    expect(writes).toHaveLength(1);
    expect(writes[0]).toContain('"vi"');
  });

  test('shows the failure state in Vietnamese', async ({ page }) => {
    await page.goto('/services?form=error');
    await page.getByLabel('Tên').fill('Ada');
    await page.getByLabel('Email').fill('ada@example.com');
    await page.getByLabel('Tin nhắn').fill('Xin chào');
    await page.getByRole('button', { name: 'Gửi', exact: true }).click();
    await expect(page.getByText('Không gửi được tin nhắn.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Thử lại' })).toBeFocused();
  });
});
