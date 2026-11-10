/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test, type Page } from '@playwright/test';
import { mockFirestore } from '../support/firestore-mock';
import { mockImages } from '../support/images';
import { gotoSkin, useSkin } from '../support/skin';
import { mockWorker } from '../support/worker';

const pageWidth = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth);

test.beforeEach(async ({ page }) => {
  await mockFirestore(page);
  await useSkin(page, 'academic');
});

test.describe('chat', () => {
  const slip = (page: Page) =>
    page.locator('[data-ac-slip]').getByText('Ask BB Bot');
  const openChat = async (page: Page) => {
    await page.locator('[data-ac-slip]').click();
    const pad = page.getByRole('dialog', { name: 'BB Bot, AI assistant' });
    await expect(pad).toBeVisible();
    return pad;
  };

  test('the slip on the ledge opens the notepad, and Escape closes it and returns focus to the slip', async ({
    page,
  }) => {
    await gotoSkin(page);
    await expect(slip(page)).toBeVisible();
    const pad = await openChat(page);
    await expect(
      pad.getByText("Hi, I'm BB Bot. How can I help?"),
    ).toBeVisible();
    await expect(
      pad.getByRole('button', { name: 'What do you do at FPT?' }),
    ).toBeVisible();
    await expect(pad.getByText('0/20 messages')).toBeVisible();
    await expect(pad.getByText('AI answers may be inaccurate.')).toBeVisible();

    await pad.getByRole('button', { name: 'Close chat' }).click();
    await expect(pad).toBeHidden();
    await expect(page.locator('[data-ac-slip]')).toBeFocused();

    await openChat(page);
    await page.keyboard.press('Escape');
    await expect(pad).toBeHidden();
    await expect(page.locator('[data-ac-slip]')).toBeFocused();
  });

  test('a question goes to the Worker with the site content and the answer is written on the notepad', async ({
    page,
  }) => {
    const received = await mockWorker(page, () => ({
      body: { text: 'I lead a team of 5.' },
      delay: 500,
    }));
    await gotoSkin(page);
    const pad = await openChat(page);

    const box = pad.getByRole('textbox', { name: 'Message' });
    const send = pad.getByRole('button', { name: 'Send chat message' });
    await expect(send).toBeDisabled();
    await box.fill('Who are you?');
    await send.click();
    await expect(box).toHaveValue('');
    await expect(pad.getByText('Who are you?')).toBeVisible();
    await expect(pad.getByText('I lead a team of 5.')).toBeVisible();
    await expect(pad.getByText('1/20 messages')).toBeVisible();
    expect(received).toHaveLength(1);
    expect(received[0].messages.at(-1)?.content).toBe('Who are you?');
    // the Worker builds the system prompt from the site content: the browser only says the language
    expect(received[0]).toMatchObject({ lang: 'en' });
    expect(received[0]).not.toHaveProperty('systemPrompt');
    // the questions not asked yet are offered again
    await expect(
      pad.getByRole('group', { name: 'Suggested questions' }),
    ).toBeVisible();
  });

  test('Enter sends and Shift+Enter adds a line', async ({ page }) => {
    const received = await mockWorker(page, () => ({ body: { text: 'ok' } }));
    await gotoSkin(page);
    const pad = await openChat(page);
    const box = pad.getByRole('textbox', { name: 'Message' });
    await box.fill('one');
    await box.press('Shift+Enter');
    await box.pressSequentially('two');
    await box.press('Enter');
    await expect(pad.getByText('1/20 messages')).toBeVisible();
    // the counter moves when the message is sent; the request reaches the stub a moment later
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
    const pad = await openChat(page);
    await pad.getByRole('textbox', { name: 'Message' }).fill('Hello there');
    await pad.getByRole('button', { name: 'Send chat message' }).click();
    await expect(pad.getByText('Something went wrong')).toBeVisible();
    await pad.getByRole('button', { name: 'Try again' }).click();
    await expect(pad.getByText('Second time lucky.')).toBeVisible();
    await expect(pad.getByText('Something went wrong')).toBeHidden();
    await expect(pad.getByText('1/20 messages')).toBeVisible();
  });

  test('a rate limit is explained', async ({ page }) => {
    await mockWorker(page, () => ({
      status: 429,
      body: { error: 'rate_limit_day' },
    }));
    await gotoSkin(page);
    const pad = await openChat(page);
    await pad.getByRole('button', { name: 'What do you do at FPT?' }).click();
    await expect(pad.getByText(/daily question limit/)).toBeVisible();
  });

  test('the notepad keeps its size while the conversation grows, and the log scrolls inside it', async ({
    page,
  }) => {
    await mockWorker(page, () => ({
      body: { text: 'A fairly long answer. '.repeat(6) },
    }));
    await gotoSkin(page);
    const pad = await openChat(page);
    const height = async () => (await pad.boundingBox())?.height ?? 0;
    const first = await height();
    const box = pad.getByRole('textbox', { name: 'Message' });
    for (const question of ['one', 'two', 'three']) {
      await box.fill(question);
      await box.press('Enter');
      // (the word `You` and the question are one line of the log)
      await expect(
        pad.getByRole('log').getByText(new RegExp(`You${question}$`)),
      ).toBeAttached();
      await expect(
        pad
          .getByRole('log')
          .getByText(/long answer\.\s*$/)
          .last(),
      ).toBeVisible({ timeout: 15_000 });
      expect(await height()).toBe(first);
    }
    const log = pad.getByRole('log');
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
    const pad = await openChat(page);
    const box = pad.getByRole('textbox', { name: 'Message' });
    await expect(box).toHaveAttribute('maxlength', '40');
    await box.fill('one');
    await box.press('Enter');
    await expect(pad.getByText('1/2 messages')).toBeVisible();
    // Enter does nothing while an answer is on its way: wait for the first one
    // (the name of the bot and the answer are one line of the log: `BB Botok`)
    await expect(pad.getByRole('log').getByText(/BB Botok$/)).toBeVisible();
    await box.fill('two');
    await box.press('Enter');
    await expect(pad.getByText('Message limit reached')).toBeVisible();
    await expect(pad.getByRole('textbox', { name: 'Message' })).toHaveCount(0);
    await expect(
      pad.getByRole('group', { name: 'Suggested questions' }),
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
    const pad = await openChat(page);
    await expect(
      pad.getByRole('button', { name: 'Do you freelance?' }),
    ).toBeVisible();
    await expect(
      pad.getByRole('button', { name: 'What do you do at FPT?' }),
    ).toHaveCount(0);
  });

  test('the conversation is kept when the notepad is closed and opened again', async ({
    page,
  }) => {
    await mockWorker(page, () => ({ body: { text: 'Kept answer.' } }));
    await gotoSkin(page);
    const pad = await openChat(page);
    await pad.getByRole('button', { name: 'Which stack do you use?' }).click();
    await expect(pad.getByText('Kept answer.')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(pad).toBeHidden();
    await openChat(page);
    await expect(pad.getByText('Kept answer.')).toBeVisible();
  });

  test('the slip is gone when the chat switch is off', async ({ page }) => {
    await mockFirestore(page, { 'site/live': { features: { chat: false } } });
    await gotoSkin(page);
    await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible();
    await expect(page.locator('[data-ac-slip]')).toHaveCount(0);
  });

  test('it unfolds from the slip, and does not move for reduced motion', async ({
    page,
  }) => {
    await gotoSkin(page);
    await page.locator('[data-ac-slip]').click();
    const sheet = page
      .getByRole('dialog', { name: 'BB Bot, AI assistant' })
      .locator('.ac-unfold');
    await expect(sheet).toBeVisible();
    expect(
      await sheet.evaluate((el) => getComputedStyle(el).animationName),
    ).toBe('ac-unfold');
    await page.keyboard.press('Escape');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.locator('[data-ac-slip]').click();
    await expect(sheet).toBeVisible();
    expect(
      await sheet.evaluate((el) => getComputedStyle(el).animationName),
    ).toBe('none');
  });

  test('the notepad slows down on its way open and never stops half-way and starts again', async ({
    page,
  }) => {
    await gotoSkin(page);
    await page.locator('[data-ac-slip]').click();
    const sheet = page
      .getByRole('dialog', { name: 'BB Bot, AI assistant' })
      .locator('.ac-unfold');
    await expect(sheet).toBeVisible();
    // the animation is stepped by hand, so the measure does not depend on how busy the machine is
    const heights = await sheet.evaluate(async (el) => {
      const animation = el.getAnimations()[0];
      animation.pause();
      const out: number[] = [];
      for (let t = 0; t <= 520; t += 20) {
        animation.currentTime = t;
        await new Promise((done) => requestAnimationFrame(done));
        out.push(new DOMMatrixReadOnly(getComputedStyle(el).transform).d);
      }
      return out;
    });
    const speeds = heights.slice(1).map((h, i) => h - heights[i]);
    // an easing curve applied between the keyframes of a three-keyframe animation brings it to rest at the middle one and sets it off again
    const speedsUp = speeds.filter(
      (v, i) => i > 0 && v > speeds[i - 1] + 0.002,
    );
    expect(speedsUp).toEqual([]);
    expect(heights.at(-1)).toBeCloseTo(1, 2);
  });

  test('on a phone the notepad fits and the page does not scroll sideways', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 780 });
    await gotoSkin(page);
    const pad = await openChat(page);
    const box = await pad.boundingBox();
    expect(box?.x).toBeGreaterThanOrEqual(0);
    expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(390);
    // what is open adds no width to the page
    const open = await pageWidth(page);
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    expect(open).toBeLessThanOrEqual(await pageWidth(page));
  });

  test.describe('in Vietnamese', () => {
    test.beforeEach(async ({ page }) => {
      await page.addInitScript(() =>
        localStorage.setItem('bach-cv-lang', 'vi'),
      );
    });

    test('the notepad and an error note are in Vietnamese', async ({
      page,
    }) => {
      await mockWorker(page, () => ({ status: 502, body: { error: 'x' } }));
      await gotoSkin(page);
      await page.locator('[data-ac-slip]').click();
      const pad = page.getByRole('dialog', { name: /BB Bot, trợ lý AI/ });
      await expect(pad).toBeVisible();
      await pad.getByRole('button', { name: 'Bạn làm gì tại FPT?' }).click();
      await expect(pad.getByText('Đã có lỗi xảy ra')).toBeVisible();
      await expect(pad.getByRole('button', { name: 'Thử lại' })).toBeVisible();
      await expect(pad.getByText('Bạn', { exact: true }).first()).toBeVisible();
    });
  });
});

test.describe('CV sheet', () => {
  /** the CV button of the header (a page may have its own) */
  const headerCv = (page: Page) =>
    page.getByRole('banner').getByRole('button', { name: 'Download CV' });
  const openCv = async (page: Page) => {
    await gotoSkin(page);
    await headerCv(page).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(
      dialog.getByRole('region', { name: 'CV preview' }),
    ).toBeVisible();
    return dialog;
  };

  test('the Download CV button opens the CV as white sheets on a sheet of paper', async ({
    page,
  }) => {
    const dialog = await openCv(page);
    await expect(
      dialog.getByRole('heading', { name: 'Bùi Ngô Tôn Bách CV' }),
    ).toBeVisible();
    await expect(
      dialog.getByRole('heading', { level: 1, name: 'Bùi Ngô Tôn Bách' }),
    ).toBeVisible();
    for (const section of ['Summary', 'Work experience', 'Education']) {
      await expect(
        dialog.getByRole('heading', { level: 2, name: section }),
      ).toHaveCount(1);
    }
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

  test('Escape closes it and focus returns to the button', async ({ page }) => {
    await openCv(page);
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(headerCv(page)).toBeFocused();
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
    await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible();
    await expect(headerCv(page)).toHaveCount(0);
  });

  test('on a phone it fills the screen and the page does not scroll sideways', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 780 });
    await gotoSkin(page);
    await headerCv(page).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    const box = await dialog.boundingBox();
    expect(box?.width).toBeLessThanOrEqual(390);
    const open = await pageWidth(page);
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    expect(open).toBeLessThanOrEqual(await pageWidth(page));
  });

  test('speaks Vietnamese', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
    await gotoSkin(page);
    await page
      .getByRole('banner')
      .getByRole('button', { name: 'Tải CV' })
      .click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('button', { name: 'Tải PDF' })).toBeVisible();
  });
});

test.describe('Connect menu', () => {
  test('opens a slip with the email, a copy button and the social links by group', async ({
    page,
    context,
  }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await gotoSkin(page);
    await page.getByRole('button', { name: 'Connect' }).click();
    await expect(page.getByText("Let's connect")).toBeVisible();
    const slip = page.locator('[data-slot="popover-content"]');
    await expect(
      slip.getByRole('link', { name: 'bachbnt@gmail.com' }),
    ).toBeVisible();
    await expect(slip.getByText('Professional')).toBeVisible();
    await slip.getByRole('button', { name: 'Copy' }).click();
    await expect(slip.getByRole('button', { name: 'Copied' })).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      'bachbnt@gmail.com',
    );
    await page.keyboard.press('Escape');
    await expect(page.getByText("Let's connect")).toBeHidden();
  });

  test('is gone when its switch is off', async ({ page }) => {
    await mockFirestore(page, {
      'site/live': { features: { connectMenu: false } },
    });
    await gotoSkin(page);
    await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Connect' })).toHaveCount(0);
  });
});

test.describe('viewer', () => {
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

  test('shows the certificate on a taped photo and steps with the buttons, the thumbnails and the arrow keys', async ({
    page,
  }) => {
    const { dialog, opener } = await openViewer(page);
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

    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(opener).toBeFocused();
  });

  test('a click outside closes it', async ({ page }) => {
    await openViewer(page);
    await page.mouse.click(4, 4);
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('on a phone it fits, the buttons are under the picture and the page does not scroll sideways', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 780 });
    await gotoSkin(page, '/certificates');
    await page
      .getByRole('button', { name: /Claude Certified Architect/ })
      .first()
      .click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    const box = await dialog.boundingBox();
    expect(box?.x).toBeGreaterThanOrEqual(0);
    expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(390);
    const open = await pageWidth(page);
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    expect(open).toBeLessThanOrEqual(await pageWidth(page));
  });
});
