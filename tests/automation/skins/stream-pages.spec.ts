/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test, type Page } from '@playwright/test';
import { mockFirestore } from '../support/firestore-mock';
import { mockImages } from '../support/images';
import { gotoSkin, useSkin } from '../support/skin';
import { mockWorker } from '../support/worker';

test.beforeEach(async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await useSkin(page, 'stream');
  await mockFirestore(page);
  await mockImages(page);
});

const reelTitle = (page: Page) =>
  page.locator('h2').filter({ hasText: /^(VenusAI|Yoga Lasyn|DevPad)$/ });

/** How long the bar of the reel takes to fill: a test that steps by hand holds it for ever, one that waits for it shortens it. */
const reelTime = (page: Page, time: string) =>
  page.addInitScript((value) => {
    const style = document.createElement('style');
    style.textContent = `:root { --sm-reel-time: ${value}; }`;
    // the script runs before the page has an <html>
    const add = () => document.documentElement.append(style);
    if (document.documentElement) add();
    else document.addEventListener('readystatechange', add, { once: true });
  }, time);

/** The segment of the open project (the bar that fills). */
const bar = (page: Page) => page.locator('[data-sm-prog]:not(.hidden)').last();
const playState = (page: Page) =>
  bar(page).evaluate((el) => getComputedStyle(el).animationPlayState);

test.describe('Projects, the Shorts page', () => {
  test.beforeEach(async ({ page }) => {
    await reelTime(page, '600s');
  });

  test('arrow keys, the buttons and the filter move through the real projects', async ({
    page,
  }) => {
    await gotoSkin(page, '/projects');
    await expect(reelTitle(page)).toHaveText('VenusAI');
    await expect(page.getByText('1 of 9')).toBeVisible();
    await page.keyboard.press('ArrowDown');
    await expect(reelTitle(page)).toHaveText('Yoga Lasyn');
    await expect(page.getByText('2 of 9')).toBeVisible();
    await page.keyboard.press('ArrowUp');
    await expect(reelTitle(page)).toHaveText('VenusAI');
    await page.getByRole('button', { name: 'Previous project' }).click();
    await expect(page.getByText('9 of 9')).toBeVisible();
    await page.getByRole('button', { name: 'Next project' }).click();
    await expect(page.getByText('1 of 9')).toBeVisible();

    const filter = page.getByRole('group', { name: 'Filter projects' });
    await filter.getByRole('button', { name: 'Personal' }).click();
    await expect(
      filter.getByRole('button', { name: 'Personal' }),
    ).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByText('1 of 4')).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 2 }).filter({ hasText: 'DevPad' }),
    ).toBeVisible();
  });

  test('the arrow keys leave a field alone', async ({ page }) => {
    await gotoSkin(page, '/projects');
    await expect(reelTitle(page)).toHaveText('VenusAI');
    await page.getByRole('textbox', { name: 'Message' }).press('ArrowDown');
    await expect(reelTitle(page)).toHaveText('VenusAI');
  });

  test('the rail opens the screenshots in the Standard viewer and has the links', async ({
    page,
  }) => {
    await gotoSkin(page, '/projects');
    await page.getByRole('button', { name: '7 screenshots' }).click();
    const viewer = page.getByRole('dialog', { name: 'VenusAI' });
    await expect(viewer).toBeVisible();
    await expect(viewer.getByText('1 of 7')).toBeVisible();
    await viewer.getByRole('button', { name: 'Next screenshot' }).click();
    await expect(viewer.getByText('2 of 7')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(viewer).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'App Store' })).toHaveAttribute(
      'target',
      '_blank',
    );
  });

  test('the live chat sits beside the reel, shows a failed answer and tries again', async ({
    page,
  }) => {
    await mockWorker(page, (n) =>
      n === 1
        ? { status: 502, body: { error: 'upstream_error' } }
        : { body: { text: 'Second time lucky.' } },
    );
    await gotoSkin(page, '/projects');
    const chat = page.getByRole('region', { name: 'BB Bot, AI assistant' });
    await expect(chat).toBeVisible();
    await expect(chat.getByText('Online')).toBeVisible();
    // docked: no chat button in the top bar and no sheet
    await expect(page.getByRole('button', { name: 'Open chat' })).toHaveCount(
      0,
    );
    const reel = await page
      .locator('h2')
      .filter({ hasText: 'VenusAI' })
      .boundingBox();
    const box = await chat.boundingBox();
    expect(box!.x).toBeGreaterThan(reel!.x + reel!.width);
    await chat.getByRole('textbox', { name: 'Message' }).fill('Hello there');
    await chat.getByRole('button', { name: 'Send chat message' }).click();
    await expect(chat.getByText('Something went wrong')).toBeVisible();
    await chat.getByRole('button', { name: 'Try again' }).click();
    await expect(chat.getByText('Second time lucky.')).toBeVisible();
    await expect(chat.getByText('1/20 messages')).toBeVisible();
  });

  test('below 1100px the chat is in a sheet opened from the top bar', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 900, height: 800 });
    await gotoSkin(page, '/projects');
    await expect(
      page.getByRole('region', { name: 'BB Bot, AI assistant' }),
    ).toHaveCount(0);
    await page.getByRole('button', { name: 'Open chat' }).click();
    const chat = page.getByRole('dialog', { name: 'BB Bot, AI assistant' });
    await expect(chat).toBeVisible();
    await expect(
      chat.getByRole('group', { name: 'Suggested questions' }),
    ).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(chat).toHaveCount(0);
  });

  test('a project with nothing to open has no rail button for it', async ({
    page,
  }) => {
    await gotoSkin(page, '/projects');
    await page
      .getByRole('group', { name: 'Filter projects' })
      .getByRole('button', { name: 'Freelance' })
      .click();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await expect(
      page.getByRole('button', { name: /screenshots?$/ }),
    ).toHaveCount(0);
  });
});

test.describe('the reel goes on by itself, and stops when asked', () => {
  test('the next project comes when the bar is full', async ({ page }) => {
    await reelTime(page, '300ms');
    await gotoSkin(page, '/projects');
    await expect(reelTitle(page)).toHaveText('Yoga Lasyn');
    await expect(page.getByText('2 of 9')).toBeVisible();
  });

  test('a turn of the wheel over the reel changes the project, once for one turn', async ({
    page,
  }) => {
    await reelTime(page, '600s');
    await gotoSkin(page, '/projects');
    await expect(reelTitle(page)).toHaveText('VenusAI');
    const box = (await page.locator('div.group\\/reel').first().boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    // a free-spinning wheel sends several events: they are one step
    await page.mouse.wheel(0, 100);
    await page.mouse.wheel(0, 100);
    await page.mouse.wheel(0, 100);
    await expect(reelTitle(page)).toHaveText('Yoga Lasyn');
    await expect(page.getByText('2 of 9')).toBeVisible();
  });

  test('the wheel turned up goes back, and a wheel outside the reel does nothing to it', async ({
    page,
  }) => {
    await reelTime(page, '600s');
    await gotoSkin(page, '/projects');
    await page.getByRole('button', { name: 'Next project' }).click();
    await expect(reelTitle(page)).toHaveText('Yoga Lasyn');
    const box = (await page.locator('div.group\\/reel').first().boundingBox())!;
    // beside the reel, over the chat: nothing happens to it
    await page.mouse.move(box.x + box.width + 120, box.y + 80);
    await page.mouse.wheel(0, 200);
    await expect(reelTitle(page)).toHaveText('Yoga Lasyn');
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.wheel(0, -200);
    await expect(reelTitle(page)).toHaveText('VenusAI');
  });

  test('the pointer on the reel stops the bar, and the pause button stops it for good', async ({
    page,
  }) => {
    await reelTime(page, '600s');
    await gotoSkin(page, '/projects');
    await expect.poll(() => playState(page)).toBe('running');
    const box = (await page.locator('div.group\\/reel').first().boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await expect.poll(() => playState(page)).toBe('paused');
    await page.mouse.move(2, 2);
    await expect.poll(() => playState(page)).toBe('running');

    const pause = page.getByRole('button', { name: 'Pause the reel' });
    await pause.click();
    const play = page.getByRole('button', { name: 'Play the reel' });
    await expect(play).toHaveAttribute('aria-pressed', 'true');
    await expect.poll(() => playState(page)).toBe('paused');
    await play.click();
    await expect(
      page.getByRole('button', { name: 'Pause the reel' }),
    ).toHaveAttribute('aria-pressed', 'false');
    await expect.poll(() => playState(page)).toBe('running');
  });

  test('it does not go on while the screenshots are open', async ({ page }) => {
    await reelTime(page, '600s');
    await gotoSkin(page, '/projects');
    await page
      .getByRole('button', { name: /screenshots$/ })
      .first()
      .click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect.poll(() => playState(page)).toBe('paused');
  });

  test.describe('with reduced motion', () => {
    test.use({ reducedMotion: 'reduce' });

    test('the bar stands still and the reel does not go on by itself', async ({
      page,
    }) => {
      await reelTime(page, '300ms');
      await gotoSkin(page, '/projects');
      await expect(reelTitle(page)).toHaveText('VenusAI');
      expect(
        await bar(page).evaluate((el) => getComputedStyle(el).animationName),
      ).toBe('none');
      await expect(
        page.getByRole('button', { name: 'Pause the reel' }),
      ).toBeHidden();
    });
  });
});
