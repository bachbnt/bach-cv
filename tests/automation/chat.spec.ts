/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test, type Page } from '@playwright/test';
import { mockFirestore } from './support/firestore-mock';
import { mockWorker } from './support/worker';

const openChat = async (page: Page) => {
  await page.getByRole('button', { name: 'Open chat' }).click();
  await expect(
    page.getByRole('dialog', { name: 'BB Bot, AI assistant' }),
  ).toBeVisible();
};

test.beforeEach(async ({ page }) => {
  await mockFirestore(page);
});

test('the button opens and closes the panel', async ({ page }) => {
  await page.goto('/');
  await openChat(page);
  const panel = page.getByRole('dialog', { name: 'BB Bot, AI assistant' });
  await expect(
    panel.getByText("Hi, I'm BB Bot. How can I help?"),
  ).toBeVisible();
  await expect(
    panel.getByRole('button', { name: 'What do you do at FPT?' }),
  ).toBeVisible();
  await expect(panel.getByText('0/20 messages')).toBeVisible();

  await panel.getByRole('button', { name: 'Close chat' }).click();
  await expect(panel).toBeHidden();

  await page.getByRole('button', { name: 'Open chat' }).click();
  await expect(panel).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(panel).toBeHidden();
  await expect(page.getByRole('button', { name: 'Open chat' })).toBeFocused();
});

test('a question goes to the Worker with the site content and the answer is shown', async ({
  page,
}) => {
  const received = await mockWorker(page, () => ({
    body: { text: 'I lead a team of 5.' },
    delay: 600,
  }));
  await page.goto('/');
  await openChat(page);

  const box = page.getByRole('textbox', { name: 'Message' });
  const send = page.getByRole('button', { name: 'Send chat message' });
  await expect(send).toBeDisabled();
  await box.fill('Who are you?');
  await send.click();

  await expect(page.getByText('BB Bot is typing')).toBeAttached();
  await expect(page.getByText('I lead a team of 5.')).toBeVisible();
  await expect(page.getByText('BB Bot is typing')).toBeHidden();
  await expect(page.getByText('1/20 messages')).toBeVisible();
  await expect(box).toHaveValue('');

  expect(received).toHaveLength(1);
  // the Worker chooses who answers
  expect(received[0].provider).toBeUndefined();
  expect(received[0].messages).toEqual([
    { role: 'user', content: 'Who are you?' },
  ]);
  expect(received[0].systemPrompt).toContain('FPT Software');
  expect(received[0].systemPrompt.length).toBeLessThanOrEqual(8000);

  // the second question carries the first answer, as the model's turn
  await box.fill('And now?');
  await box.press('Enter');
  await expect(page.getByText('2/20 messages')).toBeVisible();
  await expect.poll(() => received.length).toBe(2);
  expect(received[1].messages.map((m) => m.role)).toEqual([
    'user',
    'model',
    'user',
  ]);
});

test('after an answer the questions not asked yet are offered again, in the message flow', async ({
  page,
}) => {
  await mockWorker(page, () => ({
    body: { text: 'Kotlin, KMM and React Native.' },
  }));
  await page.goto('/');
  await openChat(page);
  const panel = page.getByRole('dialog', { name: 'BB Bot, AI assistant' });
  const chips = panel.getByRole('group', { name: 'Suggested questions' });
  await expect(chips.getByRole('button')).toHaveCount(4);

  await chips.getByRole('button', { name: 'Which stack do you use?' }).click();
  await expect(panel.getByText('Kotlin, KMM and React Native.')).toBeVisible();

  // the one asked is gone, the other three are offered again (as in the design)
  await expect(chips.getByRole('button')).toHaveCount(3);
  await expect(
    chips.getByRole('button', { name: 'Which stack do you use?' }),
  ).toHaveCount(0);

  // they sit inside the message log, after the answer, so they never cover a message
  const log = panel.getByRole('log');
  await expect(
    log.getByRole('group', { name: 'Suggested questions' }),
  ).toBeVisible();
  const answer = await panel
    .getByText('Kotlin, KMM and React Native.')
    .boundingBox();
  const row = await chips.boundingBox();
  expect(answer && row && row.y >= answer.y + answer.height - 1).toBe(true);
});

test('a failed answer can be tried again without counting twice', async ({
  page,
}) => {
  await mockWorker(page, (n) =>
    n === 1
      ? { status: 502, body: { error: 'upstream_error' } }
      : { body: { text: 'Second time lucky.' } },
  );
  await page.goto('/');
  await openChat(page);
  await page.getByRole('textbox', { name: 'Message' }).fill('Hello there');
  await page.getByRole('button', { name: 'Send chat message' }).click();

  await expect(page.getByText('Something went wrong')).toBeVisible();
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page.getByText('Second time lucky.')).toBeVisible();
  await expect(page.getByText('Something went wrong')).toBeHidden();
  await expect(page.getByText('1/20 messages')).toBeVisible();
});

test('a rate limit is explained', async ({ page }) => {
  await mockWorker(page, () => ({
    status: 429,
    body: { error: 'rate_limit_day' },
  }));
  await page.goto('/');
  await openChat(page);
  await page.getByRole('button', { name: 'What do you do at FPT?' }).click();
  await expect(page.getByText(/daily question limit/)).toBeVisible();
});

test('the message limit from settings ends the conversation', async ({
  page,
}) => {
  await mockFirestore(page, {
    'site/settings': { chat: { maxUserMessages: 2, maxInputLength: 40 } },
  });
  await mockWorker(page, () => ({ body: { text: 'ok' } }));
  await page.goto('/');
  await openChat(page);

  const box = page.getByRole('textbox', { name: 'Message' });
  await expect(box).toHaveAttribute('maxlength', '40');
  await box.fill('one');
  await box.press('Enter');
  await expect(page.getByText('1/2 messages')).toBeVisible();
  await expect(page.getByText('ok', { exact: true })).toBeVisible();
  await box.fill('two');
  await box.press('Enter');

  await expect(page.getByText('Message limit reached')).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Message' })).toHaveCount(0);
  await expect(
    page.getByRole('group', { name: 'Suggested questions' }),
  ).toHaveCount(0);
});

test('suggestions come from settings when there are some', async ({ page }) => {
  await mockFirestore(page, {
    'site/settings': {
      chat: { suggestions: [{ id: 'one', text: 'Do you freelance?' }] },
    },
  });
  await page.goto('/');
  await openChat(page);
  await expect(
    page.getByRole('button', { name: 'Do you freelance?' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'What do you do at FPT?' }),
  ).toHaveCount(0);
});

test('the buttons on Home open the chat', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Ask BB Bot' }).click();
  const panel = page.getByRole('dialog', { name: 'BB Bot, AI assistant' });
  await expect(panel).toBeVisible();
  await panel.getByRole('button', { name: 'Close chat' }).click();

  const card = page.getByRole('button', { name: 'Chat with BB Bot' });
  await card.scrollIntoViewIfNeeded();
  await card.click();
  await expect(panel).toBeVisible();
});

test('the chat is gone when its switch is off', async ({ page }) => {
  await mockFirestore(page, { 'site/live': { features: { chat: false } } });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Open chat' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Ask BB Bot' })).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: 'Chat with BB Bot' }),
  ).toHaveCount(0);
});

test('motion is off for visitors who prefer reduced motion', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const fab = page.getByRole('button', { name: 'Open chat' });
  await expect(fab).toBeVisible();
  expect(await fab.evaluate((el) => getComputedStyle(el).animationName)).toBe(
    'none',
  );
});

test('the button icon turns into a cross and back with a spin, and does not spin for reduced motion', async ({
  page,
}) => {
  await mockWorker(page, () => ({ body: { text: 'ok' } }));
  await page.goto('/');
  const fab = page.getByRole('button', { name: 'Open chat' });
  // the button's name changes when it opens, so find its icons by the button's class
  const glyphs = page.locator('button.bb-fab svg');
  const [chat, close] = [glyphs.nth(0), glyphs.nth(1)];
  const state = (el: typeof chat) =>
    el.evaluate((node) => {
      const s = getComputedStyle(node);
      return {
        opacity: s.opacity,
        transform: s.transform,
        time: s.transitionDuration,
      };
    });

  // the widget's own motion is on (the button grows in when the page opens)
  expect(await fab.evaluate((el) => getComputedStyle(el).animationName)).toBe(
    'bb-fab-in',
  );

  // closed: the chat bubble shows, the cross waits turned away
  expect((await state(chat)).opacity).toBe('1');
  expect((await state(close)).opacity).toBe('0');
  expect((await state(close)).transform).not.toBe('none');
  expect((await state(chat)).time).not.toBe('0s');

  await fab.click();
  const closeFab = page.locator('button[aria-expanded="true"]');
  await expect(closeFab).toBeVisible();
  await expect.poll(async () => (await state(close)).transform).toBe('none');
  expect((await state(close)).opacity).toBe('1');
  // the bubble has spun away
  expect((await state(chat)).opacity).toBe('0');
  expect((await state(chat)).transform).not.toBe('none');

  await closeFab.click();
  await expect.poll(async () => (await state(chat)).transform).toBe('none');
  expect((await state(chat)).opacity).toBe('1');
});

test('the icon swap has no motion for reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const icon = page
    .getByRole('button', { name: 'Open chat' })
    .locator('svg')
    .first();
  expect(
    await icon.evaluate((node) => getComputedStyle(node).transitionDuration),
  ).toBe('0s');
});

test('on a phone the panel fits and the page does not scroll sideways', async ({
  page,
}) => {
  await mockWorker(page, () => ({
    body: { text: 'A long answer. '.repeat(40) },
  }));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await openChat(page);
  await page.getByRole('button', { name: 'How can I contact you?' }).click();
  await expect(page.getByText(/A long answer/)).toBeVisible();

  const panel = page.getByRole('dialog', { name: 'BB Bot, AI assistant' });
  const box = await panel.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(390);
  expect(box!.y).toBeGreaterThanOrEqual(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);

  // touch targets reach 44px
  const close = await panel
    .getByRole('button', { name: 'Close chat' })
    .boundingBox();
  expect(close!.height).toBeGreaterThanOrEqual(36);
});

test.describe('Vietnamese', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
  });

  test('the panel, the suggestions and the request are in Vietnamese', async ({
    page,
  }) => {
    const received = await mockWorker(page, () => ({
      body: { text: 'Mình dẫn dắt một nhóm 5 người.' },
    }));
    await page.goto('/');
    await page.getByRole('button', { name: 'Mở chat' }).click();
    const panel = page.getByRole('dialog', { name: 'BB Bot, trợ lý AI' });
    await expect(panel).toBeVisible();
    await expect(panel.getByText('Xin chào, mình là BB Bot.')).toBeVisible();
    await expect(
      panel.getByRole('textbox', { name: 'Tin nhắn' }),
    ).toHaveAttribute('placeholder', 'Hỏi mình bất cứ điều gì');
    await expect(panel.getByText('0/20 tin nhắn')).toBeVisible();

    await panel.getByRole('button', { name: 'Bạn làm gì tại FPT?' }).click();
    await expect(
      panel.getByText('Mình dẫn dắt một nhóm 5 người.'),
    ).toBeVisible();
    expect(received[0].messages[0].content).toBe('Bạn làm gì tại FPT?');
    expect(received[0].systemPrompt).toContain('answer in Vietnamese');
  });

  test('an error note is in Vietnamese', async ({ page }) => {
    await mockWorker(page, () => ({ status: 502, body: { error: 'x' } }));
    await page.goto('/');
    await page.getByRole('button', { name: 'Mở chat' }).click();
    await page.getByRole('button', { name: 'Bạn làm gì tại FPT?' }).click();
    await expect(page.getByText('Đã có lỗi xảy ra')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Thử lại' })).toBeVisible();
  });
});

test('changing the language keeps the conversation', async ({ page }) => {
  await mockWorker(page, () => ({ body: { text: 'Kept answer.' } }));
  await page.goto('/');
  await openChat(page);
  await page.getByRole('button', { name: 'What do you do at FPT?' }).click();
  await expect(page.getByText('Kept answer.')).toBeVisible();

  // the switch lives in the header; use it like a visitor would
  await page
    .getByRole('button', { name: /Language|Ngôn ngữ/ })
    .first()
    .click();
  await page.getByRole('menuitemradio', { name: 'Tiếng Việt' }).click();

  const panel = page.getByRole('dialog', { name: 'BB Bot, trợ lý AI' });
  await expect(panel.getByText('Xin chào, mình là BB Bot.')).toBeVisible();
  await expect(panel.getByText('Kept answer.')).toBeVisible();
  await expect(panel.getByRole('textbox', { name: 'Tin nhắn' })).toBeVisible();
  await expect(panel.getByText('1/20 tin nhắn')).toBeVisible();
});

test('the panel says the assistant is online, in both languages', async ({
  page,
}) => {
  await mockWorker(page, () => ({ body: { text: 'ok' } }));
  await page.goto('/');
  await page.getByRole('button', { name: 'Open chat' }).click();
  const panel = page.getByRole('dialog');
  await expect(panel.getByText('Online', { exact: true })).toBeVisible();
  await expect(panel.getByText('AI assistant', { exact: true })).toBeVisible();
});

test('the panel says Trực tuyến in Vietnamese', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
  await mockWorker(page, () => ({ body: { text: 'ok' } }));
  await page.goto('/');
  await page.getByRole('button', { name: 'Mở chat' }).click();
  await expect(
    page.getByRole('dialog').getByText('Trực tuyến', { exact: true }),
  ).toBeVisible();
});
