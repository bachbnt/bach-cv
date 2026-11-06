/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test, type Page } from '@playwright/test';
import { mockFirestore } from '../support/firestore-mock';
import { blockCrossOriginFetch, mockImages } from '../support/images';
import { gotoSkin, useSkin } from '../support/skin';
import { mockWorker } from '../support/worker';

const noHorizontalScroll = (page: Page) =>
  page.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth,
  );

test.beforeEach(async ({ page }) => {
  await mockFirestore(page);
  await useSkin(page, 'dev');
});

test.describe('chat', () => {
  const openChat = async (page: Page) => {
    await page.getByRole('button', { name: 'Open chat' }).click();
    const panel = page.getByRole('dialog', { name: 'BB Bot, AI assistant' });
    await expect(panel).toBeVisible();
    return panel;
  };

  test('the launcher opens and closes the window, and Escape returns focus to it', async ({
    page,
  }) => {
    await gotoSkin(page);
    const panel = await openChat(page);
    await expect(
      panel.getByText("Hi, I'm BB Bot. How can I help?"),
    ).toBeVisible();
    await expect(
      panel.getByRole('button', { name: 'What do you do at FPT?' }),
    ).toBeVisible();
    await expect(panel.getByText('0/20 messages')).toBeVisible();
    await expect(
      page.locator('button[aria-expanded="true"]'),
    ).toHaveAccessibleName('Close chat');

    await panel.getByRole('button', { name: 'Close chat' }).click();
    await expect(panel).toBeHidden();
    await expect(page.getByRole('button', { name: 'Open chat' })).toBeFocused();

    await page.getByRole('button', { name: 'Open chat' }).click();
    await expect(panel).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(panel).toBeHidden();
    await expect(page.getByRole('button', { name: 'Open chat' })).toBeFocused();
  });

  test('the keyboard shortcut toggles the chat', async ({ page }) => {
    await gotoSkin(page);
    await expect(page.getByRole('button', { name: 'Open chat' })).toBeVisible();
    await page.keyboard.press('Control+/');
    const panel = page.getByRole('dialog', { name: 'BB Bot, AI assistant' });
    await expect(panel).toBeVisible();
    await page.keyboard.press('Control+/');
    await expect(panel).toBeHidden();
  });

  test('a question goes to the Worker with the site content and the answer is shown', async ({
    page,
  }) => {
    const received = await mockWorker(page, () => ({
      body: { text: 'I lead a team of 5.' },
      delay: 600,
    }));
    await gotoSkin(page);
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
    expect(received[0].provider).toBeUndefined();
    expect(received[0].messages).toEqual([
      { role: 'user', content: 'Who are you?' },
    ]);
    expect(received[0].systemPrompt).toContain('FPT Software');
    expect(received[0].systemPrompt.length).toBeLessThanOrEqual(8000);

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
    await gotoSkin(page);
    const panel = await openChat(page);
    const chips = panel.getByRole('group', { name: 'Suggested questions' });
    await expect(chips.getByRole('button')).toHaveCount(4);

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

  test('a new answer types out word by word, the whole text being in the page at once', async ({
    page,
  }) => {
    const answer = Array.from({ length: 120 }, (_, i) => `word${i}`).join(' ');
    await mockWorker(page, () => ({ body: { text: answer } }));
    await gotoSkin(page);
    const panel = await openChat(page);
    await panel
      .getByRole('button', { name: 'Which stack do you use?' })
      .click();

    const text = panel.getByRole('log').getByText(answer);
    await expect(text).toBeAttached();
    await expect(text).toHaveText(answer);
    const words = panel.locator('[data-word]');
    await expect(words).toHaveCount(120);

    const opacities = () =>
      words.evaluateAll((els) => [
        Number(getComputedStyle(els[0]).opacity),
        Number(getComputedStyle(els[els.length - 1]).opacity),
      ]);
    await expect
      .poll(async () => {
        const [first, last] = await opacities();
        return first === 1 && last < 1;
      })
      .toBe(true);
    await expect.poll(async () => (await opacities())[1]).toBe(1);

    // what was said before is shown at once when the window is opened again
    await panel.getByRole('button', { name: 'Close chat' }).click();
    await openChat(page);
    await expect(page.getByText(answer)).toBeVisible();
    await expect(page.locator('[data-word]')).toHaveCount(0);
  });

  test('an answer is not typed out for visitors who prefer reduced motion', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const answer = Array.from({ length: 120 }, (_, i) => `word${i}`).join(' ');
    await mockWorker(page, () => ({ body: { text: answer } }));
    await gotoSkin(page);
    const panel = await openChat(page);
    await panel
      .getByRole('button', { name: 'Which stack do you use?' })
      .click();

    await expect(panel.getByText(answer)).toBeVisible();
    const last = panel.locator('[data-word]').last();
    expect(await last.evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
    expect(
      await last.evaluate((el) => getComputedStyle(el).animationName),
    ).toBe('none');
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
    await gotoSkin(page);
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
    await gotoSkin(page);
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

  test('suggestions come from settings when there are some', async ({
    page,
  }) => {
    await mockFirestore(page, {
      'site/settings': {
        chat: { suggestions: [{ id: 'one', text: 'Do you freelance?' }] },
      },
    });
    await gotoSkin(page);
    await openChat(page);
    await expect(
      page.getByRole('button', { name: 'Do you freelance?' }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'What do you do at FPT?' }),
    ).toHaveCount(0);
  });

  test('the buttons on Home open the chat', async ({ page }) => {
    await gotoSkin(page);
    await page.getByRole('button', { name: 'Ask BB Bot' }).first().click();
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
    await gotoSkin(page);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Open chat' })).toHaveCount(
      0,
    );
    await expect(page.getByRole('button', { name: 'Ask BB Bot' })).toHaveCount(
      0,
    );
    await expect(
      page.getByRole('button', { name: 'Chat with BB Bot' }),
    ).toHaveCount(0);
  });

  test('motion is off for visitors who prefer reduced motion', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await gotoSkin(page);
    const fab = page.getByRole('button', { name: 'Open chat' });
    await expect(fab).toBeVisible();
    expect(await fab.evaluate((el) => getComputedStyle(el).animationName)).toBe(
      'none',
    );
    expect(
      await fab.evaluate((el) => getComputedStyle(el).transitionDuration),
    ).toBe('0s');
  });

  test('the red light closes, the yellow one folds to the last message, the green one makes it bigger', async ({
    page,
  }) => {
    await mockWorker(page, () => ({ body: { text: 'Folded answer.' } }));
    await gotoSkin(page);
    const panel = await openChat(page);
    await page.getByRole('button', { name: 'What do you do at FPT?' }).click();
    await expect(panel.getByText('Folded answer.')).toBeVisible();

    const normal = await panel.boundingBox();
    await panel.getByRole('button', { name: 'Make the chat bigger' }).click();
    await expect
      .poll(async () => (await panel.boundingBox())?.width)
      .toBeGreaterThan(normal!.width + 100);
    await panel.getByRole('button', { name: 'Make the chat smaller' }).click();
    await expect
      .poll(async () => (await panel.boundingBox())?.width)
      .toBeCloseTo(normal!.width, 0);

    await panel.getByRole('button', { name: 'Fold the chat' }).click();
    await expect(panel.getByRole('log')).toBeHidden();
    await expect(panel.getByText('Folded answer.')).toBeVisible();
    const folded = await panel.boundingBox();
    expect(folded!.height).toBeLessThan(normal!.height / 2);
    await expect(panel.getByRole('textbox', { name: 'Message' })).toBeFocused();

    await panel.getByRole('button', { name: 'Unfold the chat' }).click();
    await expect(panel.getByRole('log')).toBeVisible();

    await panel.getByRole('button', { name: 'Close chat' }).click();
    await expect(panel).toBeHidden();

    // the conversation is kept
    await openChat(page);
    await expect(page.getByText('Folded answer.')).toBeVisible();
  });

  test('on a phone the window fits and the page does not scroll sideways', async ({
    page,
  }) => {
    await mockWorker(page, () => ({
      body: { text: 'A long answer. '.repeat(40) },
    }));
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoSkin(page);
    const panel = await openChat(page);
    await page.getByRole('button', { name: 'How can I contact you?' }).click();
    await expect(page.getByText(/A long answer/)).toBeVisible();

    const box = await panel.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(390);
    expect(box!.y).toBeGreaterThanOrEqual(0);
    expect(await noHorizontalScroll(page)).toBe(true);
  });

  test.describe('Vietnamese', () => {
    test.beforeEach(async ({ page }) => {
      await page.addInitScript(() =>
        localStorage.setItem('bach-cv-lang', 'vi'),
      );
    });

    test('the window, the suggestions and the request are in Vietnamese', async ({
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
        panel.getByRole('button', { name: 'Thu gọn chat' }),
      ).toBeVisible();

      await panel.getByRole('button', { name: 'Bạn làm gì tại FPT?' }).click();
      await expect(
        panel.getByText('Mình dẫn dắt một nhóm 5 người.'),
      ).toBeVisible();
      expect(received[0].messages[0].content).toBe('Bạn làm gì tại FPT?');
      expect(received[0].systemPrompt).toContain('answer in Vietnamese');
    });

    test('an error note is in Vietnamese', async ({ page }) => {
      await mockWorker(page, () => ({ status: 502, body: { error: 'x' } }));
      await gotoSkin(page);
      await page.getByRole('button', { name: 'Mở chat' }).click();
      await page.getByRole('button', { name: 'Bạn làm gì tại FPT?' }).click();
      await expect(page.getByText('Đã có lỗi xảy ra')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Thử lại' })).toBeVisible();
    });
  });
});

test.describe('CV window', () => {
  const openCv = async (page: Page) => {
    await gotoSkin(page);
    await page.getByRole('button', { name: 'Download CV' }).last().click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(
      dialog.getByRole('region', { name: 'CV preview' }),
    ).toBeVisible();
    await expect(dialog.getByRole('heading', { level: 1 })).toBeVisible();
    return dialog;
  };

  test('the Download CV button opens the CV as sheets', async ({ page }) => {
    const dialog = await openCv(page);
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
    ]) {
      await expect(
        dialog.getByRole('heading', { level: 2, name: section }),
      ).toHaveCount(1);
    }
    expect(
      await dialog.locator('section[aria-label^="Page"]').count(),
    ).toBeGreaterThan(1);
  });

  test('the sheets stay white in the dark theme', async ({ page }) => {
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

  test('the CV lists visible entries newest first and honours the cv mode', async ({
    page,
  }) => {
    const dialog = await openCv(page);
    const text = await dialog
      .getByRole('region', { name: 'CV preview' })
      .innerText();
    expect(text.indexOf('FPT Software')).toBeGreaterThan(-1);
    expect(text.indexOf('FPT Software')).toBeLessThan(text.indexOf('MoMo'));
    expect(text).not.toContain('American Code Lab');
    expect(text).not.toContain('TMA Solutions');
    expect(text).toContain('Thesis: Stock Price Trend Prediction');
  });

  test('Escape closes the CV and returns focus to the button', async ({
    page,
  }) => {
    await openCv(page);
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(
      page.getByRole('button', { name: 'Download CV' }).first(),
    ).toBeFocused();
  });

  test('focus never reaches the page behind the window and the red light closes it', async ({
    page,
  }) => {
    const dialog = await openCv(page);
    // the dialog moves focus into itself right after it opens; Tab only makes sense once that has happened
    await expect
      .poll(() =>
        page.evaluate(() => !!document.activeElement?.closest('[role=dialog]')),
      )
      .toBe(true);
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press('Tab');
      expect(
        await page.evaluate(
          () => !document.activeElement?.closest('[data-skin-root]'),
        ),
      ).toBe(true);
    }
    await dialog.getByRole('button', { name: 'Close' }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('Download PDF saves a file named from the profile', async ({ page }) => {
    const dialog = await openCv(page);
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 60_000 }),
      dialog.getByRole('button', { name: 'Download PDF' }).click(),
    ]);
    expect(download.suggestedFilename()).toBe('bui-ngo-ton-bach-cv.pdf');
  });

  test('the button is gone when the CV switch is off', async ({ page }) => {
    await mockFirestore(page, {
      'site/live': { features: { cvDownload: false } },
    });
    await gotoSkin(page);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Download CV' })).toHaveCount(
      0,
    );
  });

  test('on a phone the CV fills the screen with sheets scaled to fit', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const dialog = await openCv(page);
    const sheet = await dialog
      .locator('section[aria-label^="Page"]')
      .first()
      .boundingBox();
    expect(sheet!.width).toBeLessThanOrEqual(390 - 16 + 1);
    expect(sheet!.width).toBeGreaterThan(300);
    expect(await noHorizontalScroll(page)).toBe(true);
    const win = page.locator(
      '[data-slot="dev-cv-window"] [data-slot="dev-window"]',
    );
    await expect
      .poll(async () => (await win.boundingBox())?.width)
      .toBeCloseTo(390, 0);
    await expect
      .poll(async () => {
        const box = await win.boundingBox();
        return box ? box.y + box.height : 0;
      })
      .toBeCloseTo(844, 0);
  });

  test('the CV and the PDF follow the Vietnamese language', async ({
    page,
  }) => {
    await page.addInitScript(() =>
      window.localStorage.setItem('bach-cv-lang', 'vi'),
    );
    await gotoSkin(page);
    await page.getByRole('button', { name: 'Tải CV' }).first().click();
    const dialog = page.getByRole('dialog');
    await expect(
      dialog.getByRole('heading', { level: 2, name: 'Kinh nghiệm làm việc' }),
    ).toBeVisible();
    await expect(dialog.getByText('Thg 1 2026 – Nay')).toBeVisible();
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 60_000 }),
      dialog.getByRole('button', { name: 'Tải PDF' }).click(),
    ]);
    expect(download.suggestedFilename()).toBe('bui-ngo-ton-bach-cv.pdf');
  });
});

test.describe('picture viewer', () => {
  test.beforeEach(async ({ page }) => {
    await mockImages(page);
  });

  const openViewer = async (page: Page) => {
    await gotoSkin(page, '/certificates');
    const opener = page
      .getByRole('button', { name: /Claude Certified Architect/ })
      .first();
    await opener.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    return { dialog, opener };
  };

  test('shows the certificate and steps with the buttons, the thumbnails and the arrow keys', async ({
    page,
  }) => {
    const { dialog, opener } = await openViewer(page);
    await expect(
      dialog.getByRole('heading', {
        name: 'Claude Certified Architect - Professional',
      }),
    ).toBeVisible();
    await expect(dialog).toContainText('Anthropic, issued Oct 31, 2026');
    await expect(dialog.getByText('1 of 3')).toBeVisible();
    await expect(
      dialog.getByRole('link', { name: 'Open PDF' }),
    ).toHaveAttribute('target', '_blank');

    await dialog.getByRole('button', { name: 'Next' }).click();
    await expect(
      dialog.getByRole('heading', {
        name: 'Google Project Management Professional Certificate',
      }),
    ).toBeVisible();
    await page.keyboard.press('ArrowRight');
    await expect(dialog.getByText('3 of 3')).toBeVisible();
    await page.keyboard.press('ArrowRight');
    await expect(dialog.getByText('1 of 3')).toBeVisible();
    await page.keyboard.press('ArrowLeft');
    await expect(dialog.getByText('3 of 3')).toBeVisible();
    await dialog.getByRole('button', { name: 'Go to 2 of 3' }).click();
    await expect(dialog.getByText('2 of 3')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(opener).toBeFocused();
  });

  test('zooms with the keys, the buttons, the wheel and a double click, and fits again', async ({
    page,
  }) => {
    const { dialog } = await openViewer(page);
    const zoom = dialog.locator('[data-slot="dev-viewer-zoom"]');
    await expect(zoom).toHaveText('100%');
    await page.keyboard.press('+');
    await expect(zoom).toHaveText('150%');
    await page.keyboard.press('-');
    await expect(zoom).toHaveText('100%');
    await dialog.getByRole('button', { name: 'Zoom in' }).click();
    await dialog.getByRole('button', { name: 'Zoom in' }).click();
    await expect(zoom).toHaveText('225%');
    await page.keyboard.press('0');
    await expect(zoom).toHaveText('100%');

    const image = dialog.locator('[data-slot="dev-viewer-stage"] img');
    await image.dblclick();
    await expect(zoom).toHaveText('200%');
    await image.dblclick();
    await expect(zoom).toHaveText('100%');
    await image.hover();
    await page.mouse.wheel(0, -300);
    await expect(zoom).not.toHaveText('100%');
    await dialog.getByRole('button', { name: 'Fit to window' }).first().click();
    await expect(zoom).toHaveText('100%');
  });

  test('the green light maximizes and shows the way back', async ({ page }) => {
    const { dialog } = await openViewer(page);
    const win = page.locator('[data-slot="dev-window"]');
    const before = await win.boundingBox();
    await dialog.getByRole('button', { name: 'Maximize' }).click();
    await expect.poll(async () => (await win.boundingBox())?.width).toBe(1280);
    expect((await win.boundingBox())!.width).toBeGreaterThan(before!.width);
    await dialog.getByRole('button', { name: 'Restore size' }).click();
    await expect
      .poll(async () => (await win.boundingBox())?.width)
      .toBeLessThan(1280);
  });

  test('the yellow light hides the thumbnails and tags, so that only the picture is left, and shows them again', async ({
    page,
  }) => {
    const { dialog } = await openViewer(page);
    const thumbs = dialog.getByRole('group', { name: 'Pictures' });
    await expect(thumbs).toBeVisible();
    await dialog
      .getByRole('button', { name: 'Hide the thumbnails and tags' })
      .click();
    await expect(thumbs).toBeHidden();
    await expect(
      dialog.locator('[data-slot="dev-viewer-stage"] img'),
    ).toBeVisible();
    await dialog
      .getByRole('button', { name: 'Show the thumbnails and tags' })
      .click();
    await expect(thumbs).toBeVisible();
  });

  test('the status line says what the picture is, and the red light closes', async ({
    page,
  }) => {
    const { dialog } = await openViewer(page);
    await expect(
      dialog.locator('[data-slot="dev-viewer-status"]'),
    ).toContainText('1 × 1 · WEBP · 1 KB');
    await dialog.getByRole('button', { name: 'Close' }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('Download saves the picture under its own name and says so', async ({
    page,
  }) => {
    const { dialog } = await openViewer(page);
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      dialog.getByRole('button', { name: 'Download' }).click(),
    ]);
    expect(download.suggestedFilename()).toBe('claude-architect.webp');
    await expect(page.getByText('Saved claude-architect.webp')).toBeVisible();
  });

  test('copying the image link says so', async ({ page }) => {
    await page
      .context()
      .grantPermissions(['clipboard-read', 'clipboard-write']);
    const { dialog } = await openViewer(page);
    await dialog.getByRole('button', { name: 'Copy the image link' }).click();
    await expect(page.getByText('Image link copied')).toBeVisible();
  });

  test.describe('when the policy of the site refuses a fetch to the host of the picture', () => {
    test.beforeEach(async ({ page }) => {
      await blockCrossOriginFetch(page);
    });

    test('the status line still has the size, without the weight', async ({
      page,
    }) => {
      const { dialog } = await openViewer(page);
      const status = dialog.locator('[data-slot="dev-viewer-status"]');
      await expect(status).toContainText('1 × 1 · WEBP');
      await expect(status).not.toContainText('KB');
    });

    test('Download opens the picture in a new tab and shows no saved message', async ({
      page,
    }) => {
      const { dialog } = await openViewer(page);
      const [tab] = await Promise.all([
        page.context().waitForEvent('page'),
        dialog.getByRole('button', { name: 'Download' }).click(),
      ]);
      await expect.poll(() => tab.url()).toContain('claude-architect.webp');
      await expect(page.getByText(/^Saved /)).toHaveCount(0);
      await expect(dialog).toBeVisible();
    });
  });

  test('on a phone the viewer fills the screen and the page does not scroll sideways', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const { dialog } = await openViewer(page);
    const win = page.locator('[data-slot="dev-window"]');
    await expect
      .poll(async () => (await win.boundingBox())?.width)
      .toBeCloseTo(390, 0);
    await expect
      .poll(async () => {
        const box = await win.boundingBox();
        return box ? box.y + box.height : 0;
      })
      .toBeCloseTo(844, 0);
    expect(await noHorizontalScroll(page)).toBe(true);
    await expect(dialog.getByRole('button', { name: 'Maximize' })).toBeHidden();
  });

  test('speaks Vietnamese', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
    await gotoSkin(page, '/certificates');
    await page
      .getByRole('button', { name: /Claude Certified Architect/ })
      .first()
      .click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText('1 / 3')).toBeVisible();
    await dialog.getByRole('button', { name: 'Tiếp theo' }).click();
    await expect(dialog.getByText('2 / 3')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
  });
});
