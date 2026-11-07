/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test, type Page } from '@playwright/test';
import { mockFirestore } from '../support/firestore-mock';
import { mockImages } from '../support/images';
import { gotoSkin, useSkin } from '../support/skin';
import { mockWorker } from '../support/worker';

/** The first visit to a page compiles it in the dev server, which is slow when the machine is busy. */
const SLOW = { timeout: 30_000 };

test.beforeEach(async ({ page }) => {
  await useSkin(page, 'trade');
  await mockFirestore(page);
  await mockImages(page);
});

const panel = (page: Page) => page.getByRole('dialog', { name: /BB Bot/ });
const aside = (page: Page) =>
  page.getByRole('complementary', { name: 'Watchlist' });

test.describe('the BB Bot panel', () => {
  test('opens in the right column in place of the watchlist, with the header of Standard', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    await expect(aside(page)).toBeVisible();
    const open = page.locator('#tv-chat-trigger');
    await expect(open).toHaveAttribute('aria-pressed', 'false');
    const list = (await aside(page).boundingBox())!;
    await open.click();
    await expect(panel(page)).toBeVisible();
    await expect(open).toHaveAttribute('aria-pressed', 'true');
    await expect(open).toHaveAccessibleName('Close chat');
    // it is the watchlist's place: the same column, and the watchlist is gone while it is open
    await expect(aside(page)).toHaveCount(0);
    // the right edge of the column is the icon rail (46px) from the edge of the window; the column is as wide as the watchlist was
    await expect
      .poll(async () => {
        const box = (await panel(page).boundingBox())!;
        return Math.round(box.x + box.width);
      })
      .toBe(1280 - 46);
    expect(
      Math.abs((await panel(page).boundingBox())!.width - list.width),
    ).toBeLessThan(2);
    await expect(
      panel(page).getByRole('heading', { name: 'BB Bot' }),
    ).toBeVisible();
    await expect(panel(page)).toContainText('Online');
    await expect(panel(page)).toContainText('AI assistant');
    await expect(panel(page)).toContainText("Hi, I'm BB Bot. How can I help?");
    await expect(
      panel(page)
        .getByRole('group', { name: 'Suggested questions' })
        .getByRole('button'),
    ).toHaveCount(4);
    await expect(panel(page)).toContainText('0/20 messages');
    await expect(panel(page)).toContainText('AI answers may be inaccurate.');
    // the page is still there and works beside it
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await page.getByRole('button', { name: 'Close chat' }).first().click();
    await expect(panel(page)).toBeHidden();
    await expect(aside(page)).toBeVisible();
  });

  test('answers a question: rows with an avatar and a name, the typing dots, the answer', async ({
    page,
  }) => {
    const received = await mockWorker(page, () => ({
      body: { text: 'I lead a team of ten.' },
      delay: 700,
    }));
    await gotoSkin(page, '/');
    await page.getByRole('button', { name: 'Open chat' }).click();
    await panel(page)
      .getByRole('textbox', { name: 'Message' })
      .fill('What do you do?');
    await panel(page)
      .getByRole('button', { name: 'Send chat message' })
      .click();
    await expect(panel(page).getByText('You', { exact: true })).toBeVisible();
    await expect(panel(page).getByText('What do you do?')).toBeVisible();
    await expect(panel(page).getByText('BB Bot is typing')).toBeAttached();
    await expect(panel(page).getByText('I lead a team of ten.')).toBeVisible();
    await expect(panel(page).getByText('BB Bot is typing')).toHaveCount(0);
    await expect(panel(page)).toContainText('1/20 messages');
    expect(received).toHaveLength(1);
    // the text is plain text that can be selected
    await expect(panel(page).getByText('I lead a team of ten.')).toHaveCSS(
      'user-select',
      /text|auto/,
    );
  });

  test('a suggested question is sent by a press and goes away once asked', async ({
    page,
  }) => {
    await mockWorker(page, () => ({ body: { text: 'Kotlin and React.' } }));
    await gotoSkin(page, '/');
    await page.getByRole('button', { name: 'Open chat' }).click();
    await panel(page)
      .getByRole('button', { name: 'Which stack do you use?' })
      .click();
    await expect(panel(page).getByText('Kotlin and React.')).toBeVisible();
    await expect(
      panel(page).getByRole('button', { name: 'Which stack do you use?' }),
    ).toHaveCount(0);
    await expect(
      panel(page)
        .getByRole('group', { name: 'Suggested questions' })
        .getByRole('button'),
    ).toHaveCount(3);
  });

  test('the composer grows with the text, Enter sends and Shift+Enter adds a line', async ({
    page,
  }) => {
    const received = await mockWorker(page, () => ({ body: { text: 'ok' } }));
    await gotoSkin(page, '/');
    await page.getByRole('button', { name: 'Open chat' }).click();
    const box = panel(page).getByRole('textbox', { name: 'Message' });
    await expect(box).toBeFocused();
    const one = (await box.boundingBox())!.height;
    await box.fill('line one');
    await page.keyboard.press('Shift+Enter');
    await page.keyboard.type('line two');
    await page.keyboard.press('Shift+Enter');
    await page.keyboard.type('line three');
    expect((await box.boundingBox())!.height).toBeGreaterThan(one + 10);
    await page.keyboard.press('Enter');
    await expect(panel(page).getByText('ok')).toBeVisible();
    expect(received[0].messages.at(-1)?.content).toBe(
      'line one\nline two\nline three',
    );
    await expect(box).toHaveValue('');
  });

  test('the send button waits for a question and stops at the length of Standard', async ({
    page,
  }) => {
    await mockFirestore(page, {
      'site/settings': { chat: { maxUserMessages: 20, maxInputLength: 40 } },
    });
    await gotoSkin(page, '/');
    await page.getByRole('button', { name: 'Open chat' }).click();
    const send = panel(page).getByRole('button', { name: 'Send chat message' });
    await expect(send).toBeDisabled();
    const box = panel(page).getByRole('textbox', { name: 'Message' });
    // the length arrives with the settings, which are read when the panel opens
    await expect(box).toHaveAttribute('maxlength', '40');
    await box.pressSequentially('abcdefghij'.repeat(5));
    await expect(box).toHaveValue('abcdefghij'.repeat(4));
    await expect(send).toBeEnabled();
  });

  test('the message limit ends the conversation, as in Standard', async ({
    page,
  }) => {
    await mockFirestore(page, {
      'site/settings': { chat: { maxUserMessages: 2, maxInputLength: 40 } },
    });
    await mockWorker(page, () => ({ body: { text: 'Answer.' } }));
    await gotoSkin(page, '/');
    await page.getByRole('button', { name: 'Open chat' }).click();
    const box = panel(page).getByRole('textbox', { name: 'Message' });
    for (const q of ['one', 'two']) {
      await box.fill(q);
      await page.keyboard.press('Enter');
      await expect(panel(page).getByText('Answer.')).toHaveCount(
        q === 'one' ? 1 : 2,
      );
    }
    await expect(panel(page).getByText('Message limit reached')).toBeVisible();
    await expect(panel(page).getByRole('textbox')).toHaveCount(0);
    await expect(panel(page)).toContainText('2/2 messages');
  });

  test('an error is explained with Try again, which asks the same question without counting it twice', async ({
    page,
  }) => {
    const received = await mockWorker(page, (n) =>
      n === 1
        ? { status: 429, body: { error: 'rate_limit' } }
        : { body: { text: 'Second time lucky.' } },
    );
    await gotoSkin(page, '/');
    await page.getByRole('button', { name: 'Open chat' }).click();
    await panel(page).getByRole('textbox').fill('Hello there');
    await page.keyboard.press('Enter');
    await expect(panel(page).getByText(/Too many questions/)).toBeVisible();
    await panel(page).getByRole('button', { name: 'Try again' }).click();
    await expect(panel(page).getByText('Second time lucky.')).toBeVisible();
    await expect(panel(page).getByText(/Too many questions/)).toHaveCount(0);
    await expect(panel(page)).toContainText('1/20 messages');
    expect(received).toHaveLength(2);
    expect(received[1].messages.at(-1)?.content).toBe('Hello there');
  });

  test('says when the assistant cannot be reached (a network failure)', async ({
    page,
  }) => {
    await page.route('http://localhost:9999/chat', (route) => route.abort());
    await gotoSkin(page, '/');
    await page.getByRole('button', { name: 'Open chat' }).click();
    await panel(page).getByRole('textbox').fill('Anyone there?');
    await page.keyboard.press('Enter');
    await expect(
      panel(page).getByText(/Could not reach the assistant/),
    ).toBeVisible();
    await expect(
      panel(page).getByRole('button', { name: 'Try again' }),
    ).toBeVisible();
  });

  test('Esc closes it and gives the focus back to the button of the rail; the conversation is kept', async ({
    page,
  }) => {
    await mockWorker(page, () => ({ body: { text: 'Kept.' } }));
    await gotoSkin(page, '/');
    const open = page.getByRole('button', { name: 'Open chat' });
    await open.click();
    await panel(page).getByRole('textbox').fill('Remember me');
    await page.keyboard.press('Enter');
    await expect(panel(page).getByText('Kept.')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(panel(page)).toBeHidden();
    await expect(open).toBeFocused();
    await expect(open).toHaveAttribute('aria-pressed', 'false');
    await open.click();
    await expect(panel(page).getByText('Kept.')).toBeVisible();
    await expect(panel(page).getByText('Remember me')).toBeVisible();
  });

  test('is one conversation that lasts while the visitor moves between pages', async ({
    page,
  }) => {
    await mockWorker(page, () => ({ body: { text: 'Still here.' } }));
    await gotoSkin(page, '/');
    await page.getByRole('button', { name: 'Open chat' }).click();
    await panel(page).getByRole('textbox').fill('Stay with me');
    await page.keyboard.press('Enter');
    await expect(panel(page).getByText('Still here.')).toBeVisible();
    // the watchlist is not there while the panel is: the pages of the dashboard (or the search) are the way on
    await page
      .getByRole('group', { name: 'The site in numbers' })
      .getByRole('link', { name: /Projects/ })
      .click();
    await expect(page).toHaveURL(/\/projects$/, SLOW);
    await expect(panel(page)).toBeVisible();
    await expect(panel(page).getByText('Still here.')).toBeVisible();
  });

  test('is opened by the Ask BB Bot buttons of the pages, and works with the watchlist hidden', async ({
    page,
  }) => {
    await page.addInitScript(() =>
      localStorage.setItem(
        'bach-cv-trade-layout',
        JSON.stringify({ watchlist: false }),
      ),
    );
    await gotoSkin(page, '/');
    await expect(aside(page)).toHaveCount(0);
    await page
      .getByRole('region', {
        name: 'I lead mobile teams and build the AI tooling they ship with.',
      })
      .getByRole('button', { name: 'Ask BB Bot' })
      .click();
    await expect(panel(page)).toBeVisible();
    expect((await panel(page).boundingBox())!.width).toBeGreaterThan(200);
    await page.keyboard.press('Escape');
    await expect(panel(page)).toBeHidden();
  });

  test('speaks Vietnamese', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
    await mockWorker(page, () => ({
      body: { text: 'Mình dẫn dắt 10 người.' },
    }));
    await gotoSkin(page, '/');
    await page.getByRole('button', { name: 'Mở chat' }).click();
    const win = page.getByRole('dialog', { name: /trợ lý AI/ });
    await expect(win).toContainText('Xin chào, mình là BB Bot.');
    await expect(win).toContainText('Trực tuyến');
    await expect(win).toContainText('0/20 tin nhắn');
    await win.getByRole('textbox', { name: 'Tin nhắn' }).fill('Bạn làm gì?');
    await win.getByRole('button', { name: 'Gửi tin nhắn' }).click();
    await expect(win.getByText('Bạn', { exact: true })).toBeVisible();
    await expect(win.getByText('Mình dẫn dắt 10 người.')).toBeVisible();
    await expect(win).toContainText(
      'Câu trả lời của AI có thể chưa chính xác.',
    );
  });

  test('is still while the visitor prefers reduced motion, with no moving dots', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await mockWorker(page, () => ({ body: { text: 'Calm.' }, delay: 600 }));
    await gotoSkin(page, '/');
    await page.getByRole('button', { name: 'Open chat' }).click();
    await panel(page).getByRole('textbox').fill('Hi there');
    await page.keyboard.press('Enter');
    const dot = panel(page).locator('i').first();
    await expect(dot).toHaveCSS('animation-name', 'none');
    await expect(panel(page).getByText('Calm.')).toBeVisible();
  });
});

test.describe('the BB Bot sheet on a phone', () => {
  test.use({ viewport: { width: 390, height: 800 }, hasTouch: true });

  test('is a bottom sheet of about 80 percent of the height, and Esc closes it and gives the focus back', async ({
    page,
  }) => {
    await mockWorker(page, () => ({ body: { text: 'On the phone.' } }));
    await gotoSkin(page, '/');
    const open = page.getByRole('button', { name: 'Open chat' });
    await open.click();
    const sheet = page.getByRole('dialog', { name: /BB Bot/ });
    await expect(sheet).toBeVisible();
    const box = (await sheet.boundingBox())!;
    expect(box.height).toBeGreaterThan(800 * 0.7);
    expect(box.height).toBeLessThan(800 * 0.9);
    expect(box.y + box.height).toBeGreaterThan(790);
    expect(box.width).toBeGreaterThanOrEqual(388);
    await expect(sheet.getByRole('heading', { name: 'BB Bot' })).toBeVisible();
    await sheet.getByRole('textbox').fill('Phone question');
    await sheet.getByRole('button', { name: 'Send chat message' }).click();
    await expect(sheet.getByText('On the phone.')).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.keyboard.press('Escape');
    await expect(sheet).toBeHidden();
    await expect(open).toBeFocused();
  });

  test('has touch-sized controls', async ({ page }) => {
    await gotoSkin(page, '/');
    await page.getByRole('button', { name: 'Open chat' }).click();
    const sheet = page.getByRole('dialog', { name: /BB Bot/ });
    for (const name of ['Close chat', 'Send chat message']) {
      const box = (await sheet.getByRole('button', { name }).boundingBox())!;
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
  });
});
