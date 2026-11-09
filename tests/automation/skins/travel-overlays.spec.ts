/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test, type Locator, type Page } from '@playwright/test';
import { mockFirestore } from '../support/firestore-mock';
import { mockImages } from '../support/images';
import { allOn, servePayments } from '../support/payments';
import { gotoSkin, useSkin } from '../support/skin';
import { mockWorker } from '../support/worker';

/** The first visit to a page compiles it in the dev server, which is slow when the machine is busy. */
const SLOW = { timeout: 30_000 };

test.beforeEach(async ({ page }) => {
  await useSkin(page, 'travel');
  await mockFirestore(page);
  await mockImages(page);
});

const noHorizontalScroll = (page: Page) =>
  page.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth,
  );

const overlaps = async (a: Locator, b: Locator) => {
  const [x, y] = [await a.boundingBox(), await b.boundingBox()];
  if (!x || !y) return false;
  return (
    x.x < y.x + y.width &&
    y.x < x.x + x.width &&
    x.y < y.y + y.height &&
    y.y < x.y + x.height
  );
};

const header = (page: Page) => page.getByRole('banner');
const chatPanel = (page: Page) =>
  page.getByRole('dialog', { name: 'BB Bot, AI assistant' });

test.describe('the BB Bot card', () => {
  const openChat = async (page: Page) => {
    await page.getByRole('button', { name: 'Open chat' }).click();
    await expect(chatPanel(page)).toBeVisible();
    return chatPanel(page);
  };

  test('the round button opens a card with the header, the greeting, the suggestions and the counter of Standard, and closes with focus back on the header button', async ({
    page,
  }) => {
    await gotoSkin(page);
    const panel = await openChat(page);
    await expect(panel.getByRole('heading', { name: 'BB Bot' })).toBeVisible();
    await expect(panel).toContainText('Online');
    await expect(panel).toContainText('AI assistant');
    await expect(
      panel.getByText("Hi, I'm BB Bot. How can I help?"),
    ).toBeVisible();
    await expect(
      panel
        .getByRole('group', { name: 'Suggested questions' })
        .getByRole('button'),
    ).toHaveCount(4);
    await expect(panel.getByText('0/20 messages')).toBeVisible();
    await expect(
      panel.getByText('AI answers may be inaccurate.'),
    ).toBeVisible();
    // the round button makes room for the card
    await expect(page.getByRole('button', { name: 'Open chat' })).toHaveCount(
      0,
    );

    await panel.getByRole('button', { name: 'Close chat' }).click();
    await expect(panel).toBeHidden();
    await expect(page.locator('#tl-chat-trigger')).toBeFocused();
    await expect(page.getByRole('button', { name: 'Open chat' })).toBeVisible();

    await openChat(page);
    await page.keyboard.press('Escape');
    await expect(chatPanel(page)).toBeHidden();
    await expect(page.locator('#tl-chat-trigger')).toBeFocused();
  });

  test('the header button opens it too', async ({ page }) => {
    await gotoSkin(page);
    await header(page).getByRole('button', { name: 'Ask BB Bot' }).click();
    await expect(chatPanel(page)).toBeVisible();
  });

  for (const [width, height] of [
    [1440, 900],
    [1024, 700],
    [800, 600],
  ] as const)
    test(`the round button and the card keep clear of the map controls and the credits at ${width} x ${height}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height });
      await gotoSkin(page);
      const fab = page.getByRole('button', { name: 'Open chat' });
      const controls = page.locator('.tl-controls');
      const credits = page.locator('.tl-credits');
      await expect(fab).toBeVisible();
      await expect(controls).toBeVisible();
      expect(await overlaps(fab, controls)).toBe(false);
      expect(await overlaps(fab, credits)).toBe(false);
      const box = (await fab.boundingBox())!;
      // at the bottom right of the map
      expect(box.x + box.width).toBeLessThanOrEqual(width);
      expect(box.y + box.height).toBeLessThanOrEqual(height);
      expect(box.x).toBeGreaterThan(width / 2);
      expect(box.y).toBeGreaterThan(height / 2);
      await fab.click();
      const panel = chatPanel(page);
      await expect(panel).toBeVisible();
      expect(await overlaps(panel, controls)).toBe(false);
      expect(await overlaps(panel, credits)).toBe(false);
      const card = (await panel.boundingBox())!;
      expect(card.x + card.width).toBeLessThanOrEqual(width);
      expect(card.y + card.height).toBeLessThanOrEqual(height);
    });

  test('a question goes to the Worker with the site content, the typing dots show, the answer comes and the box is cleared', async ({
    page,
  }) => {
    const received = await mockWorker(page, () => ({
      body: { text: 'I lead a team of 5.' },
      delay: 600,
    }));
    await gotoSkin(page);
    const panel = await openChat(page);
    const box = panel.getByRole('textbox', { name: 'Message' });
    const send = panel.getByRole('button', { name: 'Send chat message' });
    await expect(send).toBeDisabled();
    await box.fill('Who are you?');
    await send.click();
    await expect(panel.getByText('BB Bot is typing')).toBeAttached();
    await expect(panel.getByText('I lead a team of 5.')).toBeVisible();
    await expect(panel.getByText('BB Bot is typing')).toBeHidden();
    await expect(panel.getByText('1/20 messages')).toBeVisible();
    await expect(box).toHaveValue('');
    expect(received).toHaveLength(1);
    expect(received[0].messages).toEqual([
      { role: 'user', content: 'Who are you?' },
    ]);
    expect(received[0].systemPrompt).toContain('FPT Software');
    await box.fill('And now?');
    await box.press('Enter');
    await expect(panel.getByText('2/20 messages')).toBeVisible();
    await expect.poll(() => received.length).toBe(2);
    expect(received[1].messages.map((m) => m.role)).toEqual([
      'user',
      'model',
      'user',
    ]);
  });

  test('Shift+Enter adds a line instead of sending', async ({ page }) => {
    const received = await mockWorker(page, () => ({ body: { text: 'ok' } }));
    await gotoSkin(page);
    const panel = await openChat(page);
    const box = panel.getByRole('textbox', { name: 'Message' });
    await box.fill('line one');
    await box.press('Shift+Enter');
    await box.pressSequentially('line two');
    await expect(box).toHaveValue('line one\nline two');
    expect(received).toHaveLength(0);
  });

  test('after an answer the questions not asked yet are offered again, in the message flow', async ({
    page,
  }) => {
    await mockWorker(page, () => ({
      body: { text: 'Kotlin, KMM and React Native.' },
    }));
    await gotoSkin(page);
    const panel = await openChat(page);
    const chips = panel.getByRole('group', { name: 'Suggested questions' });
    await chips
      .getByRole('button', { name: 'Which stack do you use?' })
      .click();
    await expect(
      panel.getByText('Kotlin, KMM and React Native.'),
    ).toBeVisible();
    await expect(chips.getByRole('button')).toHaveCount(3);
    await expect(
      chips.getByRole('button', { name: 'Which stack do you use?' }),
    ).toHaveCount(0);
    // the lines rise into place; measure them once they have stopped
    await panel.evaluate((el) =>
      Promise.all(
        el
          .getAnimations({ subtree: true })
          .filter((a) => a.effect?.getComputedTiming().iterations !== Infinity)
          .map((a) => a.finished),
      ),
    );
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
    await gotoSkin(page);
    const panel = await openChat(page);
    await panel.getByRole('textbox', { name: 'Message' }).fill('Hello there');
    await panel.getByRole('button', { name: 'Send chat message' }).click();
    await expect(panel.getByText('Something went wrong')).toBeVisible();
    await panel.getByRole('button', { name: 'Try again' }).click();
    await expect(panel.getByText('Second time lucky.')).toBeVisible();
    await expect(panel.getByText('Something went wrong')).toBeHidden();
    await expect(panel.getByText('1/20 messages')).toBeVisible();
  });

  test('a rate limit is explained', async ({ page }) => {
    await mockWorker(page, () => ({
      status: 429,
      body: { error: 'rate_limit_day' },
    }));
    await gotoSkin(page);
    const panel = await openChat(page);
    await panel.getByRole('button', { name: 'What do you do at FPT?' }).click();
    await expect(panel.getByText(/daily question limit/)).toBeVisible();
  });

  test('the message limit from settings ends the conversation', async ({
    page,
  }) => {
    await mockFirestore(page, {
      'site/settings': { chat: { maxUserMessages: 2, maxInputLength: 40 } },
    });
    await mockWorker(page, () => ({ body: { text: 'ok' } }));
    await gotoSkin(page);
    const panel = await openChat(page);
    const box = panel.getByRole('textbox', { name: 'Message' });
    await expect(box).toHaveAttribute('maxlength', '40');
    await box.fill('one');
    await box.press('Enter');
    await expect(panel.getByText('1/2 messages')).toBeVisible();
    await expect(panel.getByText('ok', { exact: true })).toBeVisible();
    await box.fill('two');
    await box.press('Enter');
    await expect(panel.getByText('Message limit reached')).toBeVisible();
    await expect(panel.getByRole('textbox', { name: 'Message' })).toHaveCount(
      0,
    );
    await expect(
      panel.getByRole('group', { name: 'Suggested questions' }),
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
    const panel = await openChat(page);
    await expect(
      panel.getByRole('button', { name: 'Do you freelance?' }),
    ).toBeVisible();
    await expect(
      panel.getByRole('button', { name: 'What do you do at FPT?' }),
    ).toHaveCount(0);
  });

  test('the conversation lasts when the card is closed and when the page changes', async ({
    page,
  }) => {
    await mockWorker(page, () => ({ body: { text: 'Kept answer.' } }));
    await gotoSkin(page);
    const panel = await openChat(page);
    await panel.getByRole('button', { name: 'What do you do at FPT?' }).click();
    await expect(panel.getByText('Kept answer.')).toBeVisible();
    await panel.getByRole('button', { name: 'Close chat' }).click();
    await openChat(page);
    await expect(chatPanel(page).getByText('Kept answer.')).toBeVisible();
    // the card stays open over the next page
    await page
      .getByRole('navigation', { name: 'Pages of the trip' })
      .getByRole('link', { name: 'Payment' })
      .click();
    await expect(page).toHaveURL(/\/payment$/);
    await expect(chatPanel(page).getByText('Kept answer.')).toBeVisible(SLOW);
  });

  test('nothing of the chat is there when its switch is off', async ({
    page,
  }) => {
    await mockFirestore(page, { 'site/live': { features: { chat: false } } });
    await gotoSkin(page);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Open chat' })).toHaveCount(
      0,
    );
    await expect(page.getByRole('button', { name: 'Ask BB Bot' })).toHaveCount(
      0,
    );
  });

  test('the round button does not pulse for visitors who prefer reduced motion', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await gotoSkin(page);
    const fab = page.getByRole('button', { name: 'Open chat' });
    await expect(fab).toBeVisible();
    expect(
      await fab.evaluate((el) => getComputedStyle(el).transitionDuration),
    ).toBe('0s');
    expect(
      await fab
        .locator('.tl-live')
        .evaluate((el) => getComputedStyle(el).animationName),
    ).toBe('none');
  });

  test('on a phone it is a sheet that fits the screen, the round button stands at the top left of the map, and the page does not scroll sideways', async ({
    page,
  }) => {
    await mockWorker(page, () => ({
      body: { text: 'A long answer. '.repeat(40) },
    }));
    await page.setViewportSize({ width: 360, height: 740 });
    await gotoSkin(page);
    const fab = page.getByRole('button', { name: 'Open chat' });
    const box = (await fab.boundingBox())!;
    expect(box.x).toBeLessThan(40);
    expect(box.y).toBeGreaterThan(50);
    expect(box.y).toBeLessThan(120);
    expect(await overlaps(fab, page.locator('.tl-controls'))).toBe(false);
    await fab.click();
    const panel = chatPanel(page);
    await expect(panel).toBeVisible();
    await panel.getByRole('button', { name: 'How can I contact you?' }).click();
    await expect(panel.getByText(/A long answer/)).toBeVisible();
    const sheet = (await panel.boundingBox())!;
    expect(sheet.x).toBeGreaterThanOrEqual(0);
    expect(sheet.x + sheet.width).toBeLessThanOrEqual(360);
    expect(sheet.y).toBeGreaterThanOrEqual(0);
    expect(await noHorizontalScroll(page)).toBe(true);
    await panel.getByRole('button', { name: 'Close chat' }).click();
    await expect(panel).toBeHidden();
    await expect(page.locator('#tl-chat-trigger')).toBeFocused();
  });

  test.describe('Vietnamese', () => {
    test.beforeEach(async ({ page }) => {
      await page.addInitScript(() =>
        localStorage.setItem('bach-cv-lang', 'vi'),
      );
    });

    test('the card, the suggestions and the request are in Vietnamese', async ({
      page,
    }) => {
      const received = await mockWorker(page, () => ({
        body: { text: 'Mình dẫn dắt một nhóm 5 người.' },
      }));
      await gotoSkin(page);
      await page.getByRole('button', { name: 'Mở chat' }).click();
      const panel = page.getByRole('dialog', { name: 'BB Bot, trợ lý AI' });
      await expect(panel).toBeVisible();
      await expect(panel.getByText('Xin chào, mình là BB Bot.')).toBeVisible();
      await expect(
        panel.getByRole('textbox', { name: 'Tin nhắn' }),
      ).toHaveAttribute('placeholder', 'Hỏi mình bất cứ điều gì');
      await expect(panel.getByText('0/20 tin nhắn')).toBeVisible();
      await expect(
        panel.getByRole('log', { name: 'Cuộc trò chuyện với BB Bot' }),
      ).toBeVisible();
      await panel.getByRole('button', { name: 'Bạn làm gì tại FPT?' }).click();
      await expect(
        panel.getByText('Mình dẫn dắt một nhóm 5 người.'),
      ).toBeVisible();
      expect(received[0].systemPrompt).toContain('answer in Vietnamese');
    });

    test('an error note and Try again are in Vietnamese', async ({ page }) => {
      await mockWorker(page, () => ({ status: 502, body: { error: 'x' } }));
      await gotoSkin(page);
      await page.getByRole('button', { name: 'Mở chat' }).click();
      await page.getByRole('button', { name: 'Bạn làm gì tại FPT?' }).click();
      await expect(page.getByText('Đã có lỗi xảy ra')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Thử lại' })).toBeVisible();
    });
  });
});

test.describe('the CV window', () => {
  const openCv = async (page: Page) => {
    await gotoSkin(page);
    await header(page).getByRole('button', { name: 'Download CV' }).click();
    const dialog = page.getByRole('dialog', { name: /CV$/ });
    await expect(dialog).toBeVisible();
    await expect(
      dialog.getByRole('region', { name: 'CV preview' }),
    ).toBeVisible(SLOW);
    return dialog;
  };

  test('the Download CV button opens the sheets of Standard in a boarding pass', async ({
    page,
  }) => {
    const dialog = await openCv(page);
    await expect(dialog).toHaveAttribute('data-slot', 'tl-dialog');
    await expect(
      dialog.getByRole('heading', { name: 'Bùi Ngô Tôn Bách CV' }),
    ).toBeVisible();
    await expect(
      dialog.getByRole('heading', { level: 1, name: 'Bùi Ngô Tôn Bách' }),
    ).toBeVisible();
    await expect(dialog.getByText('bachbnt@gmail.com')).toBeVisible();
    for (const section of [
      'Summary',
      'Work experience',
      'Education',
      'Certifications',
      'Skills',
      'Projects & research',
    ])
      await expect(
        dialog.getByRole('heading', { level: 2, name: section }),
      ).toHaveCount(1);
    await expect(
      dialog.getByRole('region', { name: /^Page 1 of/ }),
    ).toBeVisible();
  });

  test('the sheets stay white in the dark theme', async ({ page }) => {
    await page.addInitScript(() =>
      localStorage.setItem('bach-cv-theme', 'dark'),
    );
    const dialog = await openCv(page);
    const sheet = dialog.locator('section[aria-label^="Page"]').first();
    expect(
      await sheet.evaluate((el) => getComputedStyle(el).backgroundColor),
    ).toBe('rgb(255, 255, 255)');
  });

  test('Escape closes it and gives the focus back to the button of the header; the close button works too', async ({
    page,
  }) => {
    const dialog = await openCv(page);
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(page.locator('#tl-cv-trigger')).toBeFocused();
    await page.locator('#tl-cv-trigger').click();
    await page
      .getByRole('dialog', { name: /CV$/ })
      .getByRole('button', { name: 'Close' })
      .click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.locator('#tl-cv-trigger')).toBeFocused();
  });

  test('the focus stays inside the window', async ({ page }) => {
    await openCv(page);
    await expect
      .poll(() =>
        page.evaluate(() => !!document.activeElement?.closest('[role=dialog]')),
      )
      .toBe(true);
    for (let i = 0; i < 12; i += 1) {
      await page.keyboard.press('Tab');
      expect(
        await page.evaluate(
          () => !document.activeElement?.closest('[data-skin-root]'),
        ),
      ).toBe(true);
    }
  });

  test('Download PDF saves a file named from the profile', async ({ page }) => {
    const dialog = await openCv(page);
    const button = dialog.getByRole('button', { name: 'Download PDF' });
    await expect(button).toBeEnabled(SLOW);
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 60_000 }),
      button.click(),
    ]);
    expect(download.suggestedFilename()).toBe('bui-ngo-ton-bach-cv.pdf');
  });

  test('shows the error with Try again when the data cannot be read, and Try again loads the CV', async ({
    page,
  }) => {
    let broken = true;
    await page.route('**/firestore.googleapis.com/**', (route) => {
      const request = route.request();
      return broken &&
        request.url().includes(':runQuery') &&
        (request.postData() ?? '').includes('"collectionId":"certificates"')
        ? route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: '{"error":{"code":500,"status":"INTERNAL"}}',
          })
        : route.fallback();
    });
    await gotoSkin(page);
    await header(page).getByRole('button', { name: 'Download CV' }).click();
    const dialog = page.getByRole('dialog');
    await expect(
      dialog.getByRole('heading', { name: "The CV couldn't be loaded" }),
    ).toBeVisible(SLOW);
    await expect(
      dialog.getByRole('button', { name: 'Download PDF' }),
    ).toBeDisabled();
    broken = false;
    await dialog.getByRole('button', { name: 'Try again' }).click();
    await expect(
      dialog.getByRole('region', { name: 'CV preview' }),
    ).toBeVisible(SLOW);
  });

  test('the button of the header is gone when the CV switch is off', async ({
    page,
  }) => {
    await mockFirestore(page, {
      'site/live': { features: { cvDownload: false } },
    });
    await gotoSkin(page);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Download CV' })).toHaveCount(
      0,
    );
  });

  test('on a phone it is a sheet from the bottom with the sheets scaled to fit', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    const dialog = await openCv(page);
    const sheet = (await dialog
      .locator('section[aria-label^="Page"]')
      .first()
      .boundingBox())!;
    expect(sheet.width).toBeLessThanOrEqual(360 - 16 + 1);
    expect(sheet.width).toBeGreaterThan(280);
    const box = (await dialog.boundingBox())!;
    expect(box.width).toBeGreaterThanOrEqual(358);
    expect(box.y + box.height).toBeGreaterThan(730);
    expect(await noHorizontalScroll(page)).toBe(true);
    await expect(
      dialog.getByRole('button', { name: 'Download PDF' }),
    ).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Close' })).toBeVisible();
  });

  test('speaks Vietnamese, in the page and in the PDF', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
    await gotoSkin(page);
    await header(page).getByRole('button', { name: 'Tải CV' }).click();
    const dialog = page.getByRole('dialog');
    await expect(
      dialog.getByRole('heading', { level: 2, name: 'Kinh nghiệm làm việc' }),
    ).toBeVisible(SLOW);
    await expect(dialog.getByText('Thg 1 2026 – Nay')).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Đóng' })).toBeVisible();
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 60_000 }),
      dialog.getByRole('button', { name: 'Tải PDF' }).click(),
    ]);
    expect(download.suggestedFilename()).toBe('bui-ngo-ton-bach-cv.pdf');
  });
});

test.describe('the picture viewer and the screenshots', () => {
  const openScreenshots = async (page: Page) => {
    await gotoSkin(page, '/projects');
    const opener = page.getByRole('button', { name: '7 screenshots' }).first();
    await opener.click();
    const win = page.getByRole('dialog', { name: 'VenusAI' });
    await expect(win).toBeVisible();
    return { win, opener };
  };

  test('shows the screenshots on a table with a toolbar, a counter, a strip of thumbnails and the arrow keys; Escape gives the focus back', async ({
    page,
  }) => {
    const { win, opener } = await openScreenshots(page);
    await expect(win).toHaveAttribute('data-slot', 'tl-dialog');
    await expect(
      win.getByRole('toolbar', { name: 'Picture tools' }),
    ).toBeVisible();
    await expect(win.getByText('1 of 7')).toBeVisible();
    const strip = win.getByRole('group', { name: 'All screenshots' });
    await expect(strip.getByRole('button')).toHaveCount(7);
    await expect(strip.getByRole('button').first()).toHaveAttribute(
      'aria-current',
      'true',
    );
    await page.keyboard.press('ArrowRight');
    await expect(win.getByText('2 of 7')).toBeVisible();
    await expect(strip.getByRole('button').nth(1)).toHaveAttribute(
      'aria-current',
      'true',
    );
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    await expect(win.getByText('7 of 7')).toBeVisible();
    await strip.getByRole('button', { name: 'Go to screenshot 4' }).click();
    await expect(win.getByText('4 of 7')).toBeVisible();
    await win.getByRole('button', { name: 'Next screenshot' }).click();
    await expect(win.getByText('5 of 7')).toBeVisible();
    await win.getByRole('button', { name: 'Previous screenshot' }).click();
    await expect(win.getByText('4 of 7')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(win).toBeHidden();
    await expect(opener).toBeFocused();
  });

  test('zooms with the buttons and the keys, fits again, and a new picture starts at the size that fits', async ({
    page,
  }) => {
    const { win } = await openScreenshots(page);
    const level = win.getByRole('img', { name: /^Zoom \d+%$/ });
    await expect(level).toHaveText('100%');
    await expect(win.getByRole('button', { name: 'Zoom out' })).toBeDisabled();
    await expect(
      win.getByRole('button', { name: 'Fit to window' }),
    ).toBeDisabled();
    const picture = win.locator('img[alt^="VenusAI screenshot"]');
    await expect(picture).toBeVisible();
    await expect
      .poll(() => picture.evaluate((img: HTMLImageElement) => img.naturalWidth))
      .toBeGreaterThan(0);
    await win.getByRole('button', { name: 'Zoom in' }).click();
    await expect(level).toHaveText('150%');
    await page.keyboard.press('+');
    await expect(level).toHaveText('200%');
    await page.keyboard.press('-');
    await expect(level).toHaveText('150%');
    await win.getByRole('button', { name: 'Fit to window' }).click();
    await expect(level).toHaveText('100%');
    await page.keyboard.press('+');
    await page.keyboard.press('0');
    await expect(level).toHaveText('100%');
    await page.keyboard.press('+');
    await page.keyboard.press('ArrowRight');
    await expect(level).toHaveText('100%');
  });

  test('a certificate has the actions the page gives in the toolbar, its caption under the picture, and steps through the certificates', async ({
    page,
  }) => {
    await gotoSkin(page, '/certificates');
    const opener = page
      .getByRole('button', { name: /Claude Certified Architect/ })
      .first();
    await opener.click();
    const win = page.getByRole('dialog');
    await expect(win).toBeVisible();
    await expect(
      win.getByRole('heading', {
        name: 'Claude Certified Architect - Professional',
      }),
    ).toBeVisible();
    await expect(win).toContainText('Anthropic, issued Oct 31, 2026');
    await expect(win.getByText('1 of 3')).toBeVisible();
    await expect(
      win.getByRole('toolbar').getByRole('link', { name: 'Open PDF' }),
    ).toHaveAttribute('target', '_blank');
    // one picture, so no strip of thumbnails
    await expect(win.getByRole('group')).toHaveCount(0);
    await page.keyboard.press('ArrowRight');
    await expect(win.getByText('2 of 3')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(win).toBeHidden();
    await expect(opener).toBeFocused();
  });

  test('keeps the focus inside the window', async ({ page }) => {
    await openScreenshots(page);
    for (let i = 0; i < 30; i += 1) await page.keyboard.press('Tab');
    expect(
      await page.evaluate(
        () =>
          document.activeElement?.closest('[data-slot="tl-dialog"]') !== null,
      ),
    ).toBe(true);
  });

  test('opens with a rise and fade, and with none for reduced motion', async ({
    page,
  }) => {
    const { win } = await openScreenshots(page);
    await expect(win).toHaveCSS('transition-property', /opacity/);
    await page.keyboard.press('Escape');
    await expect(win).toBeHidden();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.getByRole('button', { name: '7 screenshots' }).first().click();
    await expect(page.getByRole('dialog', { name: 'VenusAI' })).toHaveCSS(
      'transition-property',
      'none',
    );
  });

  test('is the whole screen on a phone', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await gotoSkin(page, '/projects');
    // the cover of a postcard keeps moving on a phone (its own animation), so the click is sent to the button without waiting for it to be still
    await page
      .getByRole('button', { name: '7 screenshots' })
      .first()
      .dispatchEvent('click');
    const win = page.getByRole('dialog', { name: 'VenusAI' });
    await expect(win).toBeVisible();
    const box = (await win.boundingBox())!;
    expect(box.width).toBeGreaterThanOrEqual(358);
    expect(box.height).toBeGreaterThanOrEqual(738);
    expect(await noHorizontalScroll(page)).toBe(true);
    await expect(
      win.getByRole('button', { name: 'Next screenshot' }),
    ).toBeVisible();
    const picture = (await win
      .locator('img[alt^="VenusAI screenshot"]')
      .boundingBox())!;
    expect(picture.x).toBeGreaterThanOrEqual(0);
    expect(picture.x + picture.width).toBeLessThanOrEqual(360);
  });

  test('speaks Vietnamese', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
    await gotoSkin(page, '/projects');
    await page
      .getByRole('button', { name: '7 ảnh chụp màn hình' })
      .first()
      .click();
    const win = page.getByRole('dialog', { name: 'VenusAI' });
    await expect(win.getByRole('button', { name: 'Phóng to' })).toBeVisible();
    await expect(
      win.getByRole('toolbar', { name: 'Công cụ xem ảnh' }),
    ).toBeVisible();
    await expect(win.getByText('1 / 7')).toBeVisible();
  });
});

test.describe('the QR ticket', () => {
  test.beforeEach(async ({ page }) => {
    await servePayments(page, allOn());
  });

  test('shows the QR, the account name and number, Copy number, Copy all details and Save QR, and each says so in the toast', async ({
    page,
    context,
  }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await gotoSkin(page, '/payment');
    await page.getByRole('button', { name: 'Enlarge BIDV QR code' }).click();
    const win = page.getByRole('dialog', { name: 'BIDV QR code' });
    await expect(win).toBeVisible();
    await expect(win).toHaveAttribute('data-slot', 'tl-dialog');
    await expect(
      win.getByRole('img', { name: 'BIDV payment QR code' }),
    ).toBeVisible();
    await expect(win.getByText('NGUYEN VAN A')).toBeVisible();
    await expect(win.getByText('1234567890')).toBeVisible();
    const toast = page.getByTestId('payment-toast');
    await win.getByRole('button', { name: 'Copy number' }).click();
    await expect(toast).toContainText('BIDV account number copied');
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      '1234567890',
    );
    await win.getByRole('button', { name: 'Copy all details' }).click();
    await expect(toast).toContainText('BIDV details copied');
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      'BIDV\nAccount name: NGUYEN VAN A\nAccount number: 1234567890',
    );
    const popup = page
      .context()
      .waitForEvent('page', { timeout: 15_000 })
      .catch(() => null);
    const download = page
      .waitForEvent('download', { timeout: 15_000 })
      .catch(() => null);
    await win.getByRole('button', { name: 'Save QR' }).click();
    // the picture is saved, or opened in a new tab where the browser refuses: the toast says which
    await expect(toast).toContainText(/QR code saved|Opened the QR image/);
    await Promise.all([popup, download]);
  });

  test('steps through the methods that have a QR with the buttons and the arrow keys, and Escape gives the focus back', async ({
    page,
  }) => {
    await gotoSkin(page, '/payment');
    const opener = page.getByRole('button', { name: 'Enlarge BIDV QR code' });
    await opener.click();
    const win = page.getByRole('dialog', { name: 'BIDV QR code' });
    await expect(win.getByText(/^1 of \d+$/)).toBeVisible();
    await win.getByRole('button', { name: 'Next method' }).click();
    const next = page.getByRole('dialog', { name: 'MoMo QR code' });
    await expect(next.getByText(/^2 of \d+$/)).toBeVisible();
    await next.getByRole('button', { name: 'Previous method' }).click();
    await expect(
      page.getByRole('dialog', { name: 'BIDV QR code' }),
    ).toBeVisible();
    await page.keyboard.press('ArrowRight');
    await expect(
      page.getByRole('dialog', { name: 'MoMo QR code' }),
    ).toBeVisible();
    await page.keyboard.press('ArrowLeft');
    await expect(
      page.getByRole('dialog', { name: 'BIDV QR code' }),
    ).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(opener).toBeFocused();
  });

  test('zooms with the toolbar and the keys, and another method starts at the size that fits', async ({
    page,
  }) => {
    await gotoSkin(page, '/payment');
    await page.getByRole('button', { name: 'Enlarge BIDV QR code' }).click();
    const win = page.getByRole('dialog', { name: 'BIDV QR code' });
    const bar = win.getByRole('toolbar', { name: 'Picture tools' });
    const level = bar.getByRole('img', { name: /^Zoom \d+%$/ });
    await expect(level).toHaveText('100%');
    await bar.getByRole('button', { name: 'Zoom in' }).click();
    await expect(level).toHaveText('150%');
    await page.keyboard.press('+');
    await expect(level).toHaveText('200%');
    await page.keyboard.press('0');
    await expect(level).toHaveText('100%');
    await page.keyboard.press('+');
    await page.keyboard.press('ArrowRight');
    await expect(
      page
        .getByRole('dialog', { name: 'MoMo QR code' })
        .getByRole('img', { name: 'Zoom 100%' }),
    ).toBeVisible();
  });

  for (const [name, width, height] of [
    ['a laptop', 1440, 900],
    ['a short laptop', 1280, 600],
    ['a phone', 390, 800],
    ['a short phone', 360, 640],
  ] as const)
    test(`keeps the ratio of the picture and fits the window without scrolling on ${name}`, async ({
      page,
    }) => {
      // the real pictures are bank cards, taller than they are wide: serve one of that shape (306 x 400)
      await page.context().route('**/qr-bidv-v2.jpg', (route) =>
        route.fulfill({
          status: 200,
          headers: { 'access-control-allow-origin': '*' },
          contentType: 'image/svg+xml',
          body: '<svg xmlns="http://www.w3.org/2000/svg" width="306" height="400"><rect width="306" height="400" fill="#1e3a8a"/><rect x="30" y="60" width="246" height="280" rx="16" fill="#fff"/></svg>',
        }),
      );
      await page.setViewportSize({ width, height });
      await gotoSkin(page, '/payment');
      await page
        .getByRole('button', { name: 'Enlarge BIDV QR code' })
        .first()
        .click();
      const win = page.getByRole('dialog', { name: 'BIDV QR code' });
      const picture = win.getByTestId('tl-qr-picture');
      await expect(picture).toBeVisible();
      await expect
        .poll(() =>
          picture.evaluate((img: HTMLImageElement) => img.naturalWidth),
        )
        .toBe(306);
      const shown = (await picture.boundingBox())!;
      expect(shown.width / shown.height).toBeCloseTo(306 / 400, 2);
      // the stage does not scroll, and the picture is not a thumbnail
      const overflow = await picture.evaluate((img) => {
        let el = img.parentElement;
        while (el && getComputedStyle(el).overflowY !== 'auto')
          el = el.parentElement;
        return el ? el.scrollHeight - el.clientHeight : -1;
      });
      expect(overflow).toBeLessThanOrEqual(0);
      const frame = (await win.boundingBox())!;
      expect(frame.y).toBeGreaterThanOrEqual(0);
      expect(frame.y + frame.height).toBeLessThanOrEqual(height + 1);
      expect(frame.x).toBeGreaterThanOrEqual(0);
      expect(frame.x + frame.width).toBeLessThanOrEqual(width + 1);
      expect(shown.height).toBeGreaterThanOrEqual(Math.min(240, height * 0.3));
      await expect(win.getByRole('button', { name: 'Save QR' })).toBeVisible();
      await expect(win.getByText('1234567890')).toBeVisible();
    });

  test('the buttons of the toolbar and the close button are at least 44 px on a touch screen', async ({
    browser,
  }) => {
    const context = await browser.newContext({
      hasTouch: true,
      isMobile: true,
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();
    await useSkin(page, 'travel');
    await mockFirestore(page);
    await mockImages(page);
    await servePayments(page, allOn());
    await gotoSkin(page, '/payment');
    await page.getByRole('button', { name: 'Show the whole panel' }).click();
    await page
      .getByRole('button', { name: 'Enlarge BIDV QR code' })
      .first()
      .dispatchEvent('click');
    const win = page.getByRole('dialog', { name: 'BIDV QR code' });
    await expect(win).toBeVisible();
    for (const name of [
      'Close QR code',
      'Zoom in',
      'Copy number',
      'Save QR',
      'Next method',
    ]) {
      const box = (await win.getByRole('button', { name }).boundingBox())!;
      expect(box.height, name).toBeGreaterThanOrEqual(44);
      expect(box.width, name).toBeGreaterThanOrEqual(44);
    }
    await context.close();
  });

  test('speaks Vietnamese', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
    await gotoSkin(page, '/payment');
    await page.getByRole('button', { name: 'Phóng to mã QR BIDV' }).click();
    const win = page.getByRole('dialog', { name: 'Mã QR BIDV' });
    await expect(
      win.getByRole('button', { name: 'Sao chép số' }),
    ).toBeVisible();
    await expect(win.getByRole('button', { name: 'Lưu mã QR' })).toBeVisible();
    await expect(win.getByRole('button', { name: 'Đóng mã QR' })).toBeVisible();
    await expect(win.getByText('Tên tài khoản')).toBeVisible();
  });
});

test.describe('the Connect postcard', () => {
  test('has the email with Copy, the links by group and the place, and Escape closes it', async ({
    page,
    context,
  }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await gotoSkin(page, '/');
    const trigger = header(page).getByRole('button', { name: 'Connect' });
    await trigger.click();
    const card = page
      .locator('[data-slot="popover-content"]')
      .filter({ hasText: "Let's connect" });
    await expect(card).toBeVisible();
    await expect(
      card.getByRole('link', { name: 'bachbnt@gmail.com' }),
    ).toHaveAttribute('href', 'mailto:bachbnt@gmail.com');
    await card.getByRole('button', { name: 'Copy' }).click();
    await expect(card.getByRole('button', { name: 'Copied' })).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      'bachbnt@gmail.com',
    );
    for (const group of ['Professional', 'Messaging', 'Social'])
      await expect(card.getByText(group, { exact: true })).toBeVisible();
    await expect(card.getByRole('link', { name: /LinkedIn/ })).toHaveAttribute(
      'target',
      '_blank',
    );
    await expect(card.getByRole('link', { name: /GitHub/ })).toBeVisible();
    await expect(card.getByText('Ho Chi Minh City, Vietnam')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(card).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test('is gone when its switch is off', async ({ page }) => {
    await mockFirestore(page, {
      'site/live': { features: { connectMenu: false } },
    });
    await gotoSkin(page);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Connect' })).toHaveCount(0);
  });

  test('fits a phone of 360 px', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await gotoSkin(page, '/');
    await header(page).getByRole('button', { name: 'Connect' }).click();
    const card = page
      .locator('[data-slot="popover-content"]')
      .filter({ hasText: "Let's connect" });
    await expect(card).toBeVisible();
    const box = (await card.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(360);
    expect(box.y + box.height).toBeLessThanOrEqual(740);
    expect(await noHorizontalScroll(page)).toBe(true);
  });

  test('speaks Vietnamese', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
    await gotoSkin(page, '/');
    await header(page).getByRole('button', { name: 'Liên hệ' }).click();
    const card = page
      .locator('[data-slot="popover-content"]')
      .filter({ hasText: 'Kết nối với mình' });
    await expect(
      card.getByText('Chuyên nghiệp', { exact: true }),
    ).toBeVisible();
    await expect(card.getByRole('button', { name: 'Sao chép' })).toBeVisible();
  });
});
