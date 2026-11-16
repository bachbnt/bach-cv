/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test, type Page } from '@playwright/test';
import { animationsSettled } from '../support/animations';
import { mockFirestore } from '../support/firestore-mock';
import { mockImages } from '../support/images';
import { allOn, servePayments } from '../support/payments';
import { gotoSkin, useSkin } from '../support/skin';
import { mockWorker } from '../support/worker';

// The overlays of the Phone skin: the BB Bot chat, the CV sheet, the Connect sheet and the picture viewer. They keep the behaviour and the
// accessible names of Standard's; what is its own is where they sit (inside the screen of the device: a sheet when the screen is narrow, a
// panel or a card when it is 900 px or more) and how they move (they rise, they are dragged down to close, the viewer steps with the finger).

const pageWidth = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth);

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** The screen of the device (the element the shell marks `data-ph-screen`, the container of the layout). */
const screenBox = async (page: Page): Promise<Box> => {
  const box = await page
    .locator('[data-ph-screen], .group\\/ph')
    .first()
    .boundingBox();
  if (!box) throw new Error('the screen has no box');
  return box;
};

/** Whether a box lies inside another, give or take a pixel of rounding. */
const lieInside = (inner: Box | null, outer: Box) => {
  if (!inner) return false;
  const e = 1;
  return (
    inner.x >= outer.x - e &&
    inner.y >= outer.y - e &&
    inner.x + inner.width <= outer.x + outer.width + e &&
    inner.y + inner.height <= outer.y + outer.height + e
  );
};

/** A mouse drag straight down from a point, then (after `hold` ms, to make it a slow one) let go. */
const dragDown = async (
  page: Page,
  x: number,
  y: number,
  dy: number,
  { hold = 0, steps = 12 } = {},
) => {
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x, y + dy, { steps });
  if (hold) await page.waitForTimeout(hold);
  await page.mouse.up();
};

/** A finger drawn from a point to another (Chrome's touch events, so the page sees `pointerType: 'touch'`). */
const swipe = async (
  page: Page,
  from: { x: number; y: number },
  to: { x: number; y: number },
) => {
  const client = await page.context().newCDPSession(page);
  const at = (p: { x: number; y: number }) => [{ x: p.x, y: p.y }];
  await client.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: at(from),
  });
  for (let i = 1; i <= 10; i++)
    await client.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: at({
        x: from.x + ((to.x - from.x) * i) / 10,
        y: from.y + ((to.y - from.y) * i) / 10,
      }),
    });
  await client.send('Input.dispatchTouchEvent', {
    type: 'touchEnd',
    touchPoints: [],
  });
};

test.beforeEach(async ({ page }) => {
  await mockFirestore(page);
  await useSkin(page, 'phone');
});

const dock = (page: Page, name: string) =>
  page.getByRole('button', { name, exact: true }).first();

test.describe('chat', () => {
  const trigger = (page: Page) => dock(page, 'Ask BB Bot');
  const openChat = async (page: Page) => {
    await trigger(page).click();
    const sheet = page.getByRole('dialog', { name: 'BB Bot, AI assistant' });
    await expect(sheet).toBeVisible();
    await animationsSettled(page);
    return sheet;
  };

  test('the dock opens the chat, and Escape or the close button closes it and returns focus to the dock', async ({
    page,
  }) => {
    await gotoSkin(page);
    const sheet = await openChat(page);
    await expect(
      sheet.getByText("Hi, I'm BB Bot. How can I help?"),
    ).toBeVisible();
    await expect(
      sheet.getByRole('button', { name: 'What do you do at FPT?' }),
    ).toBeVisible();
    await expect(sheet.getByText('0/20 messages')).toBeVisible();
    await expect(
      sheet.getByText('AI answers may be inaccurate.'),
    ).toBeVisible();

    await sheet.getByRole('button', { name: 'Close chat' }).click();
    await expect(sheet).toBeHidden();
    await expect(trigger(page)).toBeFocused();

    await openChat(page);
    await page.keyboard.press('Escape');
    await expect(sheet).toBeHidden();
    await expect(trigger(page)).toBeFocused();
  });

  test('a question goes to the Worker with the language only and the answer appears in the conversation', async ({
    page,
  }) => {
    const received = await mockWorker(page, () => ({
      body: { text: 'I lead a team of 5.' },
      delay: 500,
    }));
    await gotoSkin(page);
    const sheet = await openChat(page);

    const box = sheet.getByRole('textbox', { name: 'Message' });
    const send = sheet.getByRole('button', { name: 'Send chat message' });
    await expect(send).toBeDisabled();
    await box.fill('Who are you?');
    await send.click();
    await expect(box).toHaveValue('');
    await expect(sheet.getByText('Who are you?')).toBeVisible();
    // while the answer is on its way: the dots, announced once
    await expect(sheet.getByText('BB Bot is typing')).toBeAttached();
    await expect(sheet.getByText('I lead a team of 5.')).toBeVisible();
    await expect(sheet.getByText('1/20 messages')).toBeVisible();
    expect(received).toHaveLength(1);
    expect(received[0].messages.at(-1)?.content).toBe('Who are you?');
    expect(received[0]).toMatchObject({ lang: 'en' });
    expect(received[0]).not.toHaveProperty('systemPrompt');
    // the questions not asked yet are offered again
    await expect(
      sheet.getByRole('group', { name: 'Suggested questions' }),
    ).toBeVisible();
  });

  test('Enter sends and Shift+Enter adds a line', async ({ page }) => {
    const received = await mockWorker(page, () => ({ body: { text: 'ok' } }));
    await gotoSkin(page);
    const sheet = await openChat(page);
    const box = sheet.getByRole('textbox', { name: 'Message' });
    await box.fill('one');
    await box.press('Shift+Enter');
    await box.pressSequentially('two');
    await box.press('Enter');
    await expect(sheet.getByText('1/20 messages')).toBeVisible();
    await expect
      .poll(() => received[0]?.messages.at(-1)?.content)
      .toBe('one\ntwo');
  });

  test('a failed answer can be tried again without counting twice', async ({
    page,
  }) => {
    await mockWorker(page, (n) =>
      n === 1
        ? { status: 502, body: { error: 'upstream_error' } }
        : { body: { text: 'Second time lucky.' } },
    );
    await gotoSkin(page);
    const sheet = await openChat(page);
    await sheet.getByRole('textbox', { name: 'Message' }).fill('Hello there');
    await sheet.getByRole('button', { name: 'Send chat message' }).click();
    await expect(sheet.getByText('Something went wrong')).toBeVisible();
    await sheet.getByRole('button', { name: 'Try again' }).click();
    await expect(sheet.getByText('Second time lucky.')).toBeVisible();
    await expect(sheet.getByText('Something went wrong')).toBeHidden();
    await expect(sheet.getByText('1/20 messages')).toBeVisible();
  });

  test('a rate limit is explained', async ({ page }) => {
    await mockWorker(page, () => ({
      status: 429,
      body: { error: 'rate_limit_day' },
    }));
    await gotoSkin(page);
    const sheet = await openChat(page);
    await sheet.getByRole('button', { name: 'What do you do at FPT?' }).click();
    await expect(sheet.getByText(/daily question limit/)).toBeVisible();
  });

  test('the sheet keeps its size while the conversation grows, and the messages scroll inside it', async ({
    page,
  }) => {
    await mockWorker(page, () => ({
      body: { text: 'A fairly long answer. '.repeat(6) },
    }));
    await gotoSkin(page);
    const sheet = await openChat(page);
    const height = async () => (await sheet.boundingBox())?.height ?? 0;
    const first = await height();
    const box = sheet.getByRole('textbox', { name: 'Message' });
    for (const question of ['one', 'two', 'three', 'four', 'five']) {
      await box.fill(question);
      await box.press('Enter');
      await expect(
        sheet.getByRole('log').getByText(question, { exact: true }),
      ).toBeAttached();
      await expect(
        sheet
          .getByRole('log')
          .getByText(/long answer\.\s*$/)
          .last(),
      ).toBeVisible({ timeout: 15_000 });
      expect(await height()).toBe(first);
    }
    const log = sheet.getByRole('log');
    expect(await log.evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(
      true,
    );
  });

  test('the message limit from settings ends the conversation', async ({
    page,
  }) => {
    await mockFirestore(page, {
      'site/settings': { chat: { maxUserMessages: 2, maxInputLength: 40 } },
    });
    await mockWorker(page, () => ({ body: { text: 'ok' } }));
    await gotoSkin(page);
    const sheet = await openChat(page);
    const box = sheet.getByRole('textbox', { name: 'Message' });
    await expect(box).toHaveAttribute('maxlength', '40');
    await box.fill('one');
    await box.press('Enter');
    await expect(sheet.getByText('1/2 messages')).toBeVisible();
    await expect(
      sheet.getByRole('log').getByText('ok', { exact: true }),
    ).toBeVisible();
    await box.fill('two');
    await box.press('Enter');
    await expect(sheet.getByText('Message limit reached')).toBeVisible();
    await expect(sheet.getByRole('textbox', { name: 'Message' })).toHaveCount(
      0,
    );
    await expect(
      sheet.getByRole('group', { name: 'Suggested questions' }),
    ).toHaveCount(0);
  });

  test('suggestions come from settings when there are some', async ({
    page,
  }) => {
    await mockFirestore(page, {
      'site/settings': {
        chat: { suggestions: [{ id: 'one', text: 'Do you freelance?' }] },
      },
    });
    await gotoSkin(page);
    const sheet = await openChat(page);
    await expect(
      sheet.getByRole('button', { name: 'Do you freelance?' }),
    ).toBeVisible();
    await expect(
      sheet.getByRole('button', { name: 'What do you do at FPT?' }),
    ).toHaveCount(0);
  });

  test('the conversation is kept when the sheet is closed and opened again', async ({
    page,
  }) => {
    await mockWorker(page, () => ({ body: { text: 'Kept answer.' } }));
    await gotoSkin(page);
    const sheet = await openChat(page);
    await sheet
      .getByRole('button', { name: 'Which stack do you use?' })
      .click();
    await expect(sheet.getByText('Kept answer.')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(sheet).toBeHidden();
    await openChat(page);
    await expect(sheet.getByText('Kept answer.')).toBeVisible();
  });

  test('there is no way to open it when the chat switch is off', async ({
    page,
  }) => {
    await mockFirestore(page, { 'site/live': { features: { chat: false } } });
    await gotoSkin(page);
    await expect(
      page.getByRole('button', { name: 'Connect' }).first(),
    ).toBeVisible();
    await expect(trigger(page)).toHaveCount(0);
  });

  test('it arrives with a motion, and does not move for reduced motion', async ({
    page,
  }) => {
    await gotoSkin(page);
    const animation = async () => {
      const sheet = await openChat(page);
      const name = await sheet.evaluate(
        (el) => getComputedStyle(el).animationName,
      );
      await page.keyboard.press('Escape');
      await expect(sheet).toBeHidden();
      return name;
    };
    expect(await animation()).toMatch(/^ph-overlay-(rise|dock-in|pop-in)$/);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    expect(await animation()).toBe('none');
  });

  test('on a wide screen it is a panel at the right edge of the screen', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await gotoSkin(page);
    const sheet = await openChat(page);
    const screen = await screenBox(page);
    const box = await sheet.boundingBox();
    expect(box?.width).toBeCloseTo(420, 0);
    expect((box?.x ?? 0) + (box?.width ?? 0)).toBeCloseTo(
      screen.x + screen.width - 16,
      0,
    );
    // from under the status bar (3rem) to 1rem above the foot
    expect(box?.height).toBeCloseTo(screen.height - 64, 0);
  });

  test('the box is a messenger field: Send on the keyboard, a send button that wakes up with text, four lines at most', async ({
    page,
  }) => {
    await gotoSkin(page);
    const sheet = await openChat(page);
    const box = sheet.getByRole('textbox', { name: 'Message' });
    const send = sheet.getByRole('button', { name: 'Send chat message' });
    await expect(box).toHaveAttribute('enterkeyhint', 'send');
    await expect(send).toBeDisabled();
    await box.fill('   ');
    await expect(send).toBeDisabled();
    await box.fill('a');
    await expect(send).toBeEnabled();
    const one = (await box.boundingBox())?.height ?? 0;
    await box.fill(['1', '2', '3', '4'].join('\n'));
    const four = (await box.boundingBox())?.height ?? 0;
    await box.fill(Array.from({ length: 12 }, (_, n) => n).join('\n'));
    const many = (await box.boundingBox())?.height ?? 0;
    expect(four).toBeGreaterThan(one + 40);
    expect(many).toBeCloseTo(four, 0);
    expect(await box.evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(
      true,
    );
  });

  test('while the conversation is empty the questions are chips that wrap under the greeting, inside the messages and clear of every border', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoSkin(page);
    const sheet = await openChat(page);
    const log = sheet.getByRole('log');
    const chips = log.getByRole('group', { name: 'Suggested questions' });
    await expect(chips).toBeVisible();
    const area = (await log.boundingBox())!;
    const buttons = await chips.getByRole('button').all();
    expect(buttons).toHaveLength(4);
    const tops = new Set<number>();
    for (const button of buttons) {
      const box = (await button.boundingBox())!;
      tops.add(Math.round(box.y));
      expect(lieInside(box, area)).toBe(true);
    }
    // they wrap in rows of their own (not one line, not a column of a single chip's width)
    expect(tops.size).toBeGreaterThan(1);
    // the greeting is a message of the assistant beside its avatar and above the chips
    const greeting = (await log
      .getByText("Hi, I'm BB Bot. How can I help?")
      .boundingBox())!;
    expect(greeting.y).toBeLessThan((await buttons[0].boundingBox())!.y);
  });

  test('once it has begun the questions are one row above the box that scrolls sideways', async ({
    page,
  }) => {
    await mockWorker(page, () => ({ body: { text: 'ok' } }));
    await page.setViewportSize({ width: 320, height: 700 });
    await gotoSkin(page);
    const sheet = await openChat(page);
    await sheet.getByRole('button', { name: 'What do you do at FPT?' }).click();
    await expect(sheet.getByText('ok', { exact: true })).toBeVisible();
    const row = sheet.getByRole('group', { name: 'Suggested questions' });
    await expect(row).toBeVisible();
    // not inside the messages any more, and a single line
    await expect(
      sheet
        .getByRole('log')
        .getByRole('group', { name: 'Suggested questions' }),
    ).toHaveCount(0);
    const tops = new Set<number>();
    for (const button of await row.getByRole('button').all())
      tops.add(Math.round((await button.boundingBox())!.y));
    expect(tops.size).toBe(1);
    expect(await row.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(
      true,
    );
    // above the box
    const composer = (await sheet
      .getByRole('textbox', { name: 'Message' })
      .boundingBox())!;
    expect((await row.boundingBox())!.y).toBeLessThan(composer.y);
  });

  test('the box tells writing assistants to leave it alone and has its send button inside the pill', async ({
    page,
  }) => {
    await gotoSkin(page);
    const sheet = await openChat(page);
    const box = sheet.getByRole('textbox', { name: 'Message' });
    for (const name of [
      'data-gramm',
      'data-gramm_editor',
      'data-enable-grammarly',
    ])
      await expect(box).toHaveAttribute(name, 'false');
    const pill = (await box.locator('..').boundingBox())!;
    const send = (await sheet
      .getByRole('button', { name: 'Send chat message' })
      .boundingBox())!;
    expect(lieInside(send, pill)).toBe(true);
  });

  test('a very long word and a list wrap inside the bubble', async ({
    page,
  }) => {
    const word = 'Supercalifragilistic'.repeat(6);
    await mockWorker(page, () => ({
      body: { text: `1. one\n2. two\n${word}` },
    }));
    await page.setViewportSize({ width: 320, height: 700 });
    await gotoSkin(page);
    const sheet = await openChat(page);
    await sheet.getByRole('button', { name: 'What do you do at FPT?' }).click();
    const bubble = sheet.getByRole('log').getByText('2. two', { exact: false });
    await expect(bubble).toBeVisible();
    const log = (await sheet.getByRole('log').boundingBox())!;
    expect(lieInside(await bubble.boundingBox(), log)).toBe(true);
    expect(
      await sheet
        .getByRole('log')
        .evaluate((el) => el.scrollWidth <= el.clientWidth),
    ).toBe(true);
  });

  test('the answers of the assistant in a row share a tight corner, the visitor on the other side does not', async ({
    page,
  }) => {
    await mockWorker(page, () => ({ body: { text: 'Sure.' } }));
    await gotoSkin(page);
    const sheet = await openChat(page);
    await sheet.getByRole('button', { name: 'What do you do at FPT?' }).click();
    await expect(sheet.getByText('Sure.')).toBeVisible();
    const corners = (text: string) =>
      sheet
        .getByRole('log')
        .getByText(text, { exact: true })
        .locator('..')
        .evaluate((el) => {
          const css = getComputedStyle(el);
          return [
            css.borderTopLeftRadius,
            css.borderTopRightRadius,
            css.borderBottomRightRadius,
            css.borderBottomLeftRadius,
          ].map(parseFloat);
        });
    // greeting, then the question (the visitor's side: its tail is at the bottom right), then the answer (a new group: a full top corner)
    const you = await corners('What do you do at FPT?');
    expect(you[2]).toBeLessThan(you[0]);
    const bot = await corners('Sure.');
    expect(bot[3]).toBeLessThan(bot[1]);
    expect(bot[0]).toBe(bot[1]);
  });

  for (const width of [390, 320])
    test(`on a phone ${width} px wide it is a sheet from the bottom edge and the page does not scroll sideways`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 700 });
      await gotoSkin(page);
      const before = await pageWidth(page);
      const sheet = await openChat(page);
      const box = await sheet.boundingBox();
      expect(box?.x).toBeGreaterThanOrEqual(0);
      expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(width);
      expect((box?.y ?? 0) + (box?.height ?? 0)).toBeCloseTo(700, 0);
      // the field and the send button are in sight, and the buttons are as big as a finger
      const send = sheet.getByRole('button', { name: 'Send chat message' });
      const size = await send.boundingBox();
      expect(size?.width).toBeGreaterThanOrEqual(44);
      expect(size?.height).toBeGreaterThanOrEqual(44);
      await expect(
        sheet.getByRole('textbox', { name: 'Message' }),
      ).toBeInViewport();
      expect(await pageWidth(page)).toBeLessThanOrEqual(
        Math.max(before, width),
      );
    });

  test.describe('in Vietnamese', () => {
    test.beforeEach(async ({ page }) => {
      await page.addInitScript(() =>
        localStorage.setItem('bach-cv-lang', 'vi'),
      );
    });

    test('the sheet and an error note are in Vietnamese', async ({ page }) => {
      await mockWorker(page, () => ({ status: 502, body: { error: 'x' } }));
      await gotoSkin(page);
      await dock(page, 'Hỏi BB Bot').click();
      const sheet = page.getByRole('dialog', { name: /BB Bot, trợ lý AI/ });
      await expect(sheet).toBeVisible();
      await sheet.getByRole('button', { name: 'Bạn làm gì tại FPT?' }).click();
      await expect(sheet.getByText('Đã có lỗi xảy ra')).toBeVisible();
      await expect(
        sheet.getByRole('button', { name: 'Thử lại' }),
      ).toBeVisible();
    });
  });
});

test.describe('CV sheet', () => {
  const openCv = async (page: Page) => {
    await gotoSkin(page);
    await dock(page, 'Download CV').click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(
      dialog.getByRole('region', { name: 'CV preview' }),
    ).toBeVisible();
    return dialog;
  };

  test('Download CV opens the CV as white sheets, with the name in its title', async ({
    page,
  }) => {
    const dialog = await openCv(page);
    await expect(
      dialog.getByRole('heading', { name: 'Bùi Ngô Tôn Bách CV' }),
    ).toBeVisible();
    await expect(
      dialog.getByRole('heading', { level: 1, name: 'Bùi Ngô Tôn Bách' }),
    ).toBeVisible();
    for (const section of ['Summary', 'Work experience', 'Education'])
      await expect(
        dialog.getByRole('heading', { level: 2, name: section }),
      ).toHaveCount(1);
    const sheet = dialog.locator('section[aria-label^="Page"]').first();
    expect(
      await sheet.evaluate((el) => getComputedStyle(el).backgroundColor),
    ).toBe('rgb(255, 255, 255)');
  });

  test('the sheets stay white in the dark theme too', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.addInitScript(() =>
      localStorage.setItem('bach-cv-theme', 'dark'),
    );
    const dialog = await openCv(page);
    const sheet = dialog.locator('section[aria-label^="Page"]').first();
    expect(
      await sheet.evaluate((el) => getComputedStyle(el).backgroundColor),
    ).toBe('rgb(255, 255, 255)');
  });

  test('Escape closes it and focus returns to the dock', async ({ page }) => {
    await openCv(page);
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(dock(page, 'Download CV')).toBeFocused();
  });

  test('the close button closes it', async ({ page }) => {
    const dialog = await openCv(page);
    await dialog.getByRole('button', { name: 'Close' }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('Download PDF saves a file named from the profile', async ({ page }) => {
    const dialog = await openCv(page);
    const download = page.waitForEvent('download');
    await dialog.getByRole('button', { name: 'Download PDF' }).click();
    expect((await download).suggestedFilename()).toMatch(/\.pdf$/);
  });

  test('the button is gone when the CV switch is off', async ({ page }) => {
    await mockFirestore(page, {
      'site/live': { features: { cvDownload: false } },
    });
    await gotoSkin(page);
    await expect(
      page.getByRole('button', { name: 'Connect' }).first(),
    ).toBeVisible();
    await expect(dock(page, 'Download CV')).toHaveCount(0);
  });

  for (const width of [390, 320])
    test(`on a phone ${width} px wide it rises from the bottom edge and the page does not scroll sideways`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 700 });
      await gotoSkin(page);
      const before = await pageWidth(page);
      await dock(page, 'Download CV').click();
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();
      await expect(
        dialog.getByRole('region', { name: 'CV preview' }),
      ).toBeVisible();
      await animationsSettled(page);
      const box = await dialog.boundingBox();
      expect(box?.x).toBeGreaterThanOrEqual(0);
      expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(width);
      expect((box?.y ?? 0) + (box?.height ?? 0)).toBeCloseTo(700, 0);
      await expect(
        dialog.getByRole('button', { name: 'Download PDF' }),
      ).toBeInViewport();
      expect(await pageWidth(page)).toBeLessThanOrEqual(
        Math.max(before, width),
      );
    });

  test('speaks Vietnamese', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
    await gotoSkin(page);
    await dock(page, 'Tải CV').click();
    await expect(
      page.getByRole('dialog').getByRole('button', { name: 'Tải PDF' }),
    ).toBeVisible();
  });
});

test.describe('Connect sheet', () => {
  test('opens with the email, a copy button, the social links by group and the place', async ({
    page,
    context,
  }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await gotoSkin(page);
    await dock(page, 'Connect').click();
    const sheet = page.getByRole('dialog', { name: "Let's connect" });
    await expect(sheet).toBeVisible();
    await expect(
      sheet.getByRole('link', { name: 'bachbnt@gmail.com' }),
    ).toBeVisible();
    for (const group of ['Professional', 'Messaging', 'Social'])
      await expect(sheet.getByText(group, { exact: true })).toBeVisible();
    await expect(sheet.getByRole('link', { name: /LinkedIn/ })).toHaveAttribute(
      'target',
      '_blank',
    );
    await expect(sheet.getByText('Ho Chi Minh City, Vietnam')).toBeVisible();
    await sheet.getByRole('button', { name: 'Copy' }).click();
    await expect(sheet.getByRole('button', { name: 'Copied' })).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      'bachbnt@gmail.com',
    );
    await page.keyboard.press('Escape');
    await expect(sheet).toBeHidden();
    await expect(dock(page, 'Connect')).toBeFocused();
  });

  test('is gone when its switch is off', async ({ page }) => {
    await mockFirestore(page, {
      'site/live': { features: { connectMenu: false } },
    });
    await gotoSkin(page);
    await expect(dock(page, 'Download CV')).toBeVisible();
    await expect(dock(page, 'Connect')).toHaveCount(0);
  });

  for (const width of [390, 320])
    test(`on a phone ${width} px wide it fits and the page does not scroll sideways`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 700 });
      await gotoSkin(page);
      const before = await pageWidth(page);
      await dock(page, 'Connect').click();
      const sheet = page.getByRole('dialog', { name: "Let's connect" });
      await expect(sheet).toBeVisible();
      await animationsSettled(page);
      const box = await sheet.boundingBox();
      expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(width);
      await expect(
        sheet.getByRole('button', { name: 'Copy' }),
      ).toBeInViewport();
      expect(await pageWidth(page)).toBeLessThanOrEqual(
        Math.max(before, width),
      );
    });

  test('speaks Vietnamese', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
    await gotoSkin(page);
    await dock(page, 'Liên hệ').click();
    const sheet = page.getByRole('dialog', { name: 'Kết nối với mình' });
    await expect(sheet.getByText('Chuyên nghiệp')).toBeVisible();
    await expect(sheet.getByRole('button', { name: 'Sao chép' })).toBeVisible();
  });
});

test.describe('Connect as a contact card', () => {
  test('has a large tile with the logo, the name, the headline and the actions as rows', async ({
    page,
  }) => {
    await gotoSkin(page);
    await dock(page, 'Connect').click();
    const sheet = page.getByRole('dialog', { name: "Let's connect" });
    await expect(sheet).toBeVisible();
    await animationsSettled(page);
    // the logo of the site on a white tile (decoration: the name is next to it), as big as the tile
    const logo = sheet.locator('img[src*="logo"]');
    await expect(logo).toHaveAttribute('alt', '');
    await expect(logo).toBeVisible();
    const tile = (await logo.locator('..').boundingBox())!;
    expect(tile.width).toBeGreaterThanOrEqual(64);
    expect((await logo.boundingBox())!.width).toBeGreaterThan(40);
    expect(
      await logo
        .locator('..')
        .evaluate((el) => getComputedStyle(el).backgroundColor),
    ).toBe('rgb(255, 255, 255)');
    await expect(sheet.getByText('Bach Bui', { exact: true })).toBeVisible();
    await expect(sheet.getByText('Software Engineer')).toBeVisible();
    // the email and every account is a row of one list, as tall as a finger
    const rows = sheet.getByRole('listitem');
    expect(await rows.count()).toBeGreaterThan(3);
    for (const row of await rows.all())
      expect(
        await row.evaluate((el) => (el as HTMLElement).offsetHeight),
      ).toBeGreaterThanOrEqual(44);
  });
});

test.describe('CV as a document viewer', () => {
  test('names the page on view, from the sheets that are there', async ({
    page,
  }) => {
    await gotoSkin(page);
    await dock(page, 'Download CV').click();
    const dialog = page.getByRole('dialog');
    const sheets = dialog.locator('section[aria-label^="Page"]');
    await expect(sheets.first()).toBeVisible();
    const total = await sheets.count();
    const indicator = dialog.locator('[data-slot=ph-cv-page]');
    await expect(indicator).toHaveText(`Page 1 of ${total}`);
    await sheets.last().scrollIntoViewIfNeeded();
    await expect(indicator).toHaveText(`Page ${total} of ${total}`);
  });
});

test.describe('drag to dismiss', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
  });

  const openConnect = async (page: Page) => {
    await gotoSkin(page);
    await dock(page, 'Connect').click();
    const sheet = page.getByRole('dialog', { name: "Let's connect" });
    await expect(sheet).toBeVisible();
    await animationsSettled(page);
    return sheet;
  };

  test('a drag down from the grabber of more than a third of the sheet closes it and focus returns to the dock', async ({
    page,
  }) => {
    const sheet = await openConnect(page);
    const grabber = (await sheet
      .locator('[data-ph-drag]')
      .first()
      .boundingBox())!;
    const height = (await sheet.boundingBox())?.height ?? 0;
    await dragDown(
      page,
      grabber.x + grabber.width / 2,
      grabber.y + 6,
      Math.round(height / 2),
    );
    await expect(sheet).toBeHidden();
    await expect(dock(page, 'Connect')).toBeFocused();
  });

  test('a quick flick from the title closes it too', async ({ page }) => {
    const sheet = await openConnect(page);
    const title = (await sheet
      .getByRole('heading', { name: "Let's connect" })
      .boundingBox())!;
    await dragDown(page, title.x + 10, title.y + 4, 90, { steps: 3 });
    await expect(sheet).toBeHidden();
  });

  test('a short slow drag moves the sheet with the pointer and it settles back, still open', async ({
    page,
  }) => {
    const sheet = await openConnect(page);
    const before = (await sheet.boundingBox())!;
    const grabber = (await sheet
      .locator('[data-ph-drag]')
      .first()
      .boundingBox())!;
    await page.mouse.move(grabber.x + grabber.width / 2, grabber.y + 6);
    await page.mouse.down();
    await page.mouse.move(grabber.x + grabber.width / 2, grabber.y + 66, {
      steps: 6,
    });
    const moved = (await sheet.boundingBox())!;
    expect(moved.y - before.y).toBeCloseTo(60, -1);
    await page.waitForTimeout(700);
    await page.mouse.up();
    await expect
      .poll(async () => (await sheet.boundingBox())?.y)
      .toBeCloseTo(before.y, 0);
    await expect(sheet).toBeVisible();
    expect(await sheet.evaluate((el) => el.style.transform)).toBe('');
  });

  test('a press on the close button is a click, not a drag', async ({
    page,
  }) => {
    const sheet = await openConnect(page);
    await sheet.getByRole('button', { name: 'Close' }).click();
    await expect(sheet).toBeHidden();
  });

  test('the chat is dragged down from its bar', async ({ page }) => {
    await gotoSkin(page);
    await dock(page, 'Ask BB Bot').click();
    const sheet = page.getByRole('dialog', { name: 'BB Bot, AI assistant' });
    await expect(sheet).toBeVisible();
    await animationsSettled(page);
    const bar = (await sheet
      .locator('[data-slot=ph-overlay-bar]')
      .boundingBox())!;
    const height = (await sheet.boundingBox())?.height ?? 0;
    await dragDown(
      page,
      bar.x + bar.width / 2,
      bar.y + 8,
      Math.round(height / 2),
    );
    await expect(sheet).toBeHidden();
  });

  test.describe('on a touch screen', () => {
    test.use({ hasTouch: true });

    test('a finger drawn down on the picture closes the viewer, and sideways steps through the pictures', async ({
      page,
    }) => {
      await mockImages(page);
      await gotoSkin(page, '/certificates');
      await page
        .getByRole('button', { name: /View Claude Certified Architect/ })
        .first()
        .click();
      const dialog = page.getByRole('dialog');
      await expect(dialog.getByText('1 of 3')).toBeVisible();
      await animationsSettled(page);
      const stage = (await dialog
        .locator('[data-ph-drag=touch]')
        .boundingBox())!;
      const middle = {
        x: stage.x + stage.width / 2,
        y: stage.y + stage.height / 2,
      };
      await swipe(
        page,
        { x: middle.x + 90, y: middle.y },
        { x: middle.x - 90, y: middle.y },
      );
      await expect(dialog.getByText('2 of 3')).toBeVisible();
      await swipe(
        page,
        { x: middle.x, y: middle.y - 60 },
        { x: middle.x, y: middle.y + 260 },
      );
      await expect(dialog).toBeHidden();
    });
  });
});

test.describe('viewer', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await mockImages(page);
  });

  const openCertificate = async (page: Page) => {
    await gotoSkin(page, '/certificates');
    const opener = page
      .getByRole('button', { name: /View Claude Certified Architect/ })
      .first();
    await opener.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    return { dialog, opener };
  };

  test('shows the certificate and steps with the buttons, the thumbnails, the arrow keys and a swipe', async ({
    page,
  }) => {
    const { dialog, opener } = await openCertificate(page);
    await expect(
      dialog.getByRole('heading', {
        name: 'Claude Certified Architect - Professional',
      }),
    ).toBeVisible();
    await expect(dialog.getByText('1 of 3')).toBeVisible();
    await expect(
      dialog.getByRole('link', { name: /Open PDF/ }),
    ).toHaveAttribute('target', '_blank');
    await dialog.getByRole('button', { name: /^Next/ }).click();
    await expect(dialog.getByText('2 of 3')).toBeVisible();
    await page.keyboard.press('ArrowRight');
    await expect(dialog.getByText('3 of 3')).toBeVisible();
    await page.keyboard.press('ArrowRight');
    await expect(dialog.getByText('1 of 3')).toBeVisible();
    await page.keyboard.press('ArrowLeft');
    await expect(dialog.getByText('3 of 3')).toBeVisible();
    await dialog.getByRole('button', { name: 'Go to 2 of 3' }).click();
    await expect(dialog.getByText('2 of 3')).toBeVisible();
    await expect(
      dialog.getByRole('button', { name: 'Go to 2 of 3' }),
    ).toHaveAttribute('aria-current', 'true');

    // a finger drawn to the left shows the next picture, to the right the previous one; a short stroke does nothing
    const stroke = (from: number, to: number) =>
      dialog
        .getByRole('img')
        .first()
        .evaluate(
          (el, [a, b]) => {
            const at = (type: string, x: number) =>
              el.dispatchEvent(
                new PointerEvent(type, {
                  pointerType: 'touch',
                  clientX: x,
                  clientY: 200,
                  bubbles: true,
                }),
              );
            at('pointerdown', a);
            at('pointermove', (a + b) / 2);
            at('pointerup', b);
          },
          [from, to],
        );
    await stroke(300, 280);
    await expect(dialog.getByText('2 of 3')).toBeVisible();
    await stroke(300, 150);
    await expect(dialog.getByText('3 of 3')).toBeVisible();
    await stroke(150, 300);
    await expect(dialog.getByText('2 of 3')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(opener).toBeFocused();
  });

  test('a click outside closes it on a wide screen', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await openCertificate(page);
    await animationsSettled(page);
    const screen = await screenBox(page);
    await page.mouse.click(screen.x + 4, screen.y + 4);
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('a payment QR code has its own names, copies the number into the toast and offers Save', async ({
    page,
  }) => {
    await gotoSkin(page, '/payment');
    await page.getByRole('button', { name: /QR/ }).first().click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(
      dialog.getByRole('button', { name: 'Close QR code' }),
    ).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Save QR' })).toBeVisible();
    await dialog.getByRole('button', { name: 'Copy number' }).click();
    await expect(
      page.getByRole('status').filter({ hasText: 'copied' }),
    ).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toMatch(
      /\d{6,}/,
    );
    await dialog.getByRole('button', { name: 'Close QR code' }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  for (const width of [390, 320])
    test(`on a phone ${width} px wide it is the whole screen, the buttons are fingers' size and the page does not scroll sideways`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 700 });
      await gotoSkin(page, '/certificates');
      const before = await pageWidth(page);
      await page
        .getByRole('button', { name: /View Claude Certified Architect/ })
        .first()
        .click();
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();
      await animationsSettled(page);
      const box = await dialog.boundingBox();
      expect(box).toMatchObject({ x: 0, y: 0, width, height: 700 });
      for (const name of [/^Close/, /^Next/, /^Previous/]) {
        const size = await dialog
          .getByRole('button', { name })
          .first()
          .boundingBox();
        expect(size?.width).toBeGreaterThanOrEqual(44);
        expect(size?.height).toBeGreaterThanOrEqual(44);
      }
      await expect(
        dialog.getByRole('link', { name: /Open PDF/ }),
      ).toBeInViewport();
      expect(await pageWidth(page)).toBeLessThanOrEqual(
        Math.max(before, width),
      );
    });

  // a tall picture (a payment QR card is taller than it is wide) is fitted inside its stage, never cropped by it, and in a folded device the
  // bar of the viewer starts below the camera
  for (const folded of [false, true])
    test(`a tall picture fits its stage in the ${folded ? 'folded' : 'open'} device, and the bar clears the camera`, async ({
      page,
    }) => {
      const tall =
        '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="1000"><rect width="600" height="1000" fill="#2a3a8c"/></svg>';
      await page
        .context()
        .route('https://raw.githubusercontent.com/**', (route) =>
          route.fulfill({
            status: 200,
            headers: {
              'access-control-allow-origin': '*',
              'content-type': 'image/svg+xml',
            },
            body: tall,
          }),
        );
      await servePayments(page, allOn());
      await page.setViewportSize({ width: 1440, height: 900 });
      await gotoSkin(page, '/payment');
      if (folded)
        await page.getByRole('button', { name: 'Fold', exact: true }).click();
      await expect(page.locator('[data-ph-screen]')).toHaveAttribute(
        'data-mode',
        'device',
      );
      await page.getByRole('button', { name: 'Enlarge BIDV QR code' }).click();
      const image = page.getByRole('dialog').getByRole('img').first();
      await expect(image).toBeVisible();
      await expect
        .poll(() =>
          image.evaluate((img) => {
            const stage = img.closest('[data-ph-drag="touch"]');
            if (!stage) return false;
            const a = img.getBoundingClientRect();
            const b = stage.getBoundingClientRect();
            return a.top >= b.top - 1 && a.bottom <= b.bottom + 1;
          }),
        )
        .toBe(true);
      if (folded) {
        // the camera is a 14 px punch hole 13 px below the top of the display (css/device.css); the device may be scaled
        const dialog = await page.getByRole('dialog').boundingBox();
        const bar = await page
          .locator('[data-slot="ph-overlay-bar"]')
          .boundingBox();
        const scale = await page
          .locator('[data-ph-screen]')
          .evaluate(
            (el) =>
              el.getBoundingClientRect().width /
              (el as HTMLElement).offsetWidth,
          );
        if (!dialog || !bar) throw new Error('no box');
        expect(bar.y - dialog.y).toBeGreaterThanOrEqual(27 * scale - 1);
      }
    });
});

// The device: in a window of 1440 x 900 the screen is the inside of a foldable device, open (a wide screen) or folded (the cover screen).
// Every overlay and its scrim lie inside the screen, never over the window.
test.describe('inside the screen of the device', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  for (const fold of ['open', 'folded'] as const)
    test.describe(`${fold}`, () => {
      test.beforeEach(async ({ page }) => {
        await mockImages(page);
        await page.addInitScript((state) => {
          window.localStorage.setItem('bach-cv-phone-fold', state);
        }, fold);
      });

      const overlays = [
        {
          name: 'the chat',
          open: async (page: Page) => {
            await dock(page, 'Ask BB Bot').click();
            return page.getByRole('dialog', { name: 'BB Bot, AI assistant' });
          },
        },
        {
          name: 'the CV',
          open: async (page: Page) => {
            await dock(page, 'Download CV').click();
            return page.getByRole('dialog');
          },
        },
        {
          name: 'the Connect sheet',
          open: async (page: Page) => {
            await dock(page, 'Connect').click();
            return page.getByRole('dialog', { name: "Let's connect" });
          },
        },
      ];

      for (const overlay of overlays)
        test(`${overlay.name} and its scrim cover the screen only`, async ({
          page,
        }) => {
          await gotoSkin(page);
          const dialog = await overlay.open(page);
          await expect(dialog).toBeVisible();
          await animationsSettled(page);
          const screen = await screenBox(page);
          expect(screen.width).toBeLessThan(1440);
          expect(lieInside(await dialog.boundingBox(), screen)).toBe(true);
          const scrim = page.locator('[data-slot=dialog-overlay]');
          expect(lieInside(await scrim.boundingBox(), screen)).toBe(true);
          // the scrim is the whole screen
          expect((await scrim.boundingBox())?.width).toBeCloseTo(
            screen.width,
            0,
          );
          expect((await scrim.boundingBox())?.height).toBeCloseTo(
            screen.height,
            0,
          );
          const narrow = screen.width < 900;
          const box = (await dialog.boundingBox())!;
          // narrow: a sheet from the foot of the screen; wide: a card or a panel that does not touch the foot
          if (narrow)
            expect(box.y + box.height).toBeCloseTo(screen.y + screen.height, 0);
          else
            expect(box.y + box.height).toBeLessThan(screen.y + screen.height);
        });

      test('the viewer covers the screen only', async ({ page }) => {
        await gotoSkin(page, '/certificates');
        await page
          .getByRole('button', { name: /View Claude Certified Architect/ })
          .first()
          .click();
        const dialog = page.getByRole('dialog');
        await expect(dialog.getByText('1 of 3')).toBeVisible();
        await animationsSettled(page);
        const screen = await screenBox(page);
        expect(lieInside(await dialog.boundingBox(), screen)).toBe(true);
        const scrim = page.locator('[data-slot=dialog-overlay]');
        expect(lieInside(await scrim.boundingBox(), screen)).toBe(true);
        if (screen.width < 900)
          expect((await dialog.boundingBox())?.width).toBeCloseTo(
            screen.width,
            0,
          );
        await page.keyboard.press('Escape');
        await expect(page.getByRole('dialog')).toHaveCount(0);
      });

      test('turning the device over with the Fold button changes the chat with the screen: a sheet on the cover, a panel on the inner screen', async ({
        page,
      }) => {
        await gotoSkin(page);
        const toggle = page.getByRole('button', { name: 'Fold', exact: true });
        await expect(toggle).toHaveAttribute(
          'aria-pressed',
          String(fold === 'folded'),
        );
        await toggle.click();
        await expect(toggle).toHaveAttribute(
          'aria-pressed',
          String(fold === 'open'),
        );
        // the layout swaps when the swing ends
        await expect
          .poll(async () => (await screenBox(page)).width < 900)
          .toBe(fold === 'open');
        await animationsSettled(page);
        await dock(page, 'Ask BB Bot').click();
        const chat = page.getByRole('dialog', { name: 'BB Bot, AI assistant' });
        await expect(chat).toBeVisible();
        await animationsSettled(page);
        const screen = await screenBox(page);
        const box = (await chat.boundingBox())!;
        expect(lieInside(box, screen)).toBe(true);
        if (fold === 'open') {
          // now folded: the cover screen is narrow and the chat rises from its foot
          expect(screen.width).toBeLessThan(900);
          expect(box.y + box.height).toBeCloseTo(screen.y + screen.height, 0);
        } else {
          expect(screen.width).toBeGreaterThan(900);
          expect(box.x + box.width).toBeCloseTo(
            screen.x + screen.width - 16,
            0,
          );
        }
      });

      test('a drag down closes a sheet in the device too', async ({ page }) => {
        await gotoSkin(page);
        await dock(page, 'Connect').click();
        const sheet = page.getByRole('dialog', { name: "Let's connect" });
        await expect(sheet).toBeVisible();
        await animationsSettled(page);
        const title = (await sheet
          .getByRole('heading', { name: "Let's connect" })
          .boundingBox())!;
        await dragDown(page, title.x + 10, title.y + 4, 240);
        await expect(sheet).toBeHidden();
      });
    });
});
