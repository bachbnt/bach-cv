/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test, type Page } from '@playwright/test';
import { mockFirestore } from '../support/firestore-mock';
import { gotoSkin, useSkin } from '../support/skin';

test.beforeEach(async ({ page }) => {
  await useSkin(page, 'dev');
  await mockFirestore(page);
});

/** Reads a value once it has stopped changing: the colours of a page that has just loaded are still in their first transition. */
const settled = async <T>(read: () => Promise<T>) => {
  let last = await read();
  for (let i = 0; i < 20; i++) {
    await new Promise((r) => setTimeout(r, 120));
    const now = await read();
    if (now === last) return now;
    last = now;
  }
  return last;
};

const codeWindow = (page: Page, file: string) =>
  page
    .locator('div[aria-hidden="true"]')
    .filter({ has: page.locator('pre') })
    .filter({ hasText: file });

test.describe('highlight occurrences in the code windows', () => {
  test('a token lights its twins in the same window only, and clears on leave', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    const bot = codeWindow(page, 'BbBot.vue');
    const profile = codeWindow(page, 'Profile.tsx');
    const template = bot.locator('.dv-tg', { hasText: /^template$/ });
    await expect(template).toHaveCount(2);
    // the Profile window grows when its data arrives and moves the windows below it: hover only after that, or the pointer is no longer over the token
    await expect(profile).toContainText('degree=');

    await template.first().hover();
    await expect(template.first()).toHaveAttribute('data-hit', '');
    await expect(template.last()).toHaveAttribute('data-hit', '');
    await expect(bot.locator('[data-hit]')).toHaveCount(2);
    // another window and other tokens are not lit
    await expect(profile.locator('[data-hit]')).toHaveCount(0);
    await expect(
      bot.locator('.dv-tg', { hasText: /^script$/ }).first(),
    ).not.toHaveAttribute('data-hit', '');
    const bg = await template
      .first()
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg).not.toMatch(/rgba\(0, 0, 0, 0\)|transparent/);
    expect(
      await template
        .first()
        .evaluate((el) => getComputedStyle(el).borderRadius),
    ).toBe('2px');

    // moving to a plain part of the window clears it, and so does leaving the window
    await bot
      .locator('.dv-tg', { hasText: /^script$/ })
      .first()
      .hover();
    await expect(bot.locator('[data-hit]')).toHaveCount(2);
    await expect(template.first()).not.toHaveAttribute('data-hit', '');
    await page.mouse.move(2, 400);
    await expect(page.locator('[data-hit]')).toHaveCount(0);
  });

  test('the same text with another colour class is not a twin', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    const profile = codeWindow(page, 'Profile.tsx');
    // `Engineer` is a function in the import and a tag in the JSX
    const asFunction = profile.locator('.dv-fn', { hasText: /^Engineer$/ });
    const asTag = profile.locator('.dv-tg', { hasText: /^Engineer$/ });
    await asFunction.hover();
    await expect(asFunction).toHaveAttribute('data-hit', '');
    await expect(asTag).not.toHaveAttribute('data-hit', '');
    await expect(profile.locator('[data-hit]')).toHaveCount(1);
  });

  test('keeps the window hidden from assistive technology and does nothing on touch', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    const bot = codeWindow(page, 'BbBot.vue');
    await expect(bot).toHaveAttribute('aria-hidden', 'true');
    const template = bot.locator('.dv-tg', { hasText: /^template$/ }).first();
    await template.scrollIntoViewIfNeeded();
    // a touch pointer over the token (not a mouse)
    await template.dispatchEvent('pointerover', {
      pointerType: 'touch',
      bubbles: true,
    });
    await expect(bot.locator('[data-hit]')).toHaveCount(0);
    // the attribute is the only thing that changes
    await expect(template).not.toHaveAttribute('class', /hit/);
  });
});

test.describe('indent guides of the Explorer', () => {
  test('the guide of the folder that holds the hovered row brightens, then returns', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    const explorer = page.getByRole('complementary', { name: 'Explorer' });
    const file = explorer.getByRole('link', { name: /Home\.java/ });
    await expect(file).toBeVisible();
    const guide = file.locator('xpath=..');
    const color = () =>
      guide.evaluate((el) => getComputedStyle(el).borderLeftColor);

    const before = await settled(color);
    await file.hover();
    await expect.poll(color).not.toBe(before);
    // the muted text colour, not a faint line (once the short transition is over)
    const muted = await explorer
      .locator('summary')
      .first()
      .evaluate((el) => {
        const probe = document.createElement('i');
        probe.style.color = 'var(--dv-muted)';
        el.appendChild(probe);
        const value = getComputedStyle(probe).color;
        probe.remove();
        return value;
      });
    await expect.poll(color).toBe(muted);
    await page.mouse.move(700, 300);
    await expect.poll(color).toBe(before);
  });

  test('hovering a folder name lights the guide of the folder above, not its own', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    const explorer = page.getByRole('complementary', { name: 'Explorer' });
    const folders = explorer.locator('details.dv-dir');
    // a folder inside a folder, if the tree has one; otherwise the first folder
    const nested = folders.locator('details.dv-dir').first();
    const inner = (await nested.count()) ? nested : folders.first();
    const guideOf = (el: ReturnType<typeof inner.locator>) =>
      el.evaluate((node) => getComputedStyle(node).borderLeftColor);
    const own = inner.locator(':scope > div');
    const parent = inner.locator('xpath=..');
    const ownBefore = await settled(() => guideOf(own));
    await inner.locator(':scope > summary').hover();
    await expect.poll(() => guideOf(own)).toBe(ownBefore);
    const parentColor = await guideOf(parent);
    expect(parentColor).not.toBe(ownBefore);
  });
});

test.describe('the minimap', () => {
  const minimap = (page: Page) => page.locator('[data-slot="dev-minimap"]');
  const slider = (page: Page) =>
    page.locator('[data-slot="dev-minimap-slider"]');
  const scrollY = (page: Page) => page.evaluate(() => window.scrollY);

  test('is hidden from assistive technology and never takes focus', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    await expect(minimap(page)).toBeVisible();
    await expect(minimap(page)).toHaveAttribute('aria-hidden', 'true');
    await expect(page.locator('body')).not.toContainText('minimap');
    const link = page.getByRole('link', { name: 'Full resume' });
    await link.focus();
    const box = (await minimap(page).boundingBox())!;
    await page.mouse.click(box.x + 40, box.y + box.height / 2);
    await expect(link).toBeFocused();
  });

  test('darkens its slider under the pointer', async ({ page }) => {
    await gotoSkin(page, '/');
    // the opacity of the slider fill (the colour is a mix with transparent)
    const alpha = () =>
      slider(page).evaluate((el) =>
        Number(/\/ ([\d.]+)\)/.exec(getComputedStyle(el).backgroundColor)?.[1]),
      );
    const before = await settled(alpha);
    const box = (await minimap(page).boundingBox())!;
    await page.mouse.move(box.x + 40, box.y + box.height / 2);
    await expect.poll(alpha).toBeGreaterThan(before + 0.05);
    await page.mouse.move(300, 300);
    await expect.poll(alpha).toBeCloseTo(before, 2);
  });

  test('scrolls the page when the slider is dragged', async ({ page }) => {
    await gotoSkin(page, '/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    expect(await scrollY(page)).toBe(0);
    const thumb = (await slider(page).boundingBox())!;
    const x = thumb.x + thumb.width / 2;
    const y = thumb.y + thumb.height / 2;
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x, y + 60, { steps: 6 });
    const mid = await scrollY(page);
    expect(mid).toBeGreaterThan(100);
    // the pointer is captured: it keeps dragging outside the minimap
    await page.mouse.move(x - 600, y + 160, { steps: 6 });
    const far = await scrollY(page);
    expect(far).toBeGreaterThan(mid);
    await page.mouse.up();
    // after the release the pointer does not drag any more
    await page.mouse.move(x, y + 260, { steps: 4 });
    expect(await scrollY(page)).toBe(far);
    const moved = (await slider(page).boundingBox())!;
    expect(moved.y).toBeGreaterThan(thumb.y + 40);
  });

  /** Where the slider should be for the page's scroll: its height from the viewport share, its top in proportion to the scroll. */
  const sliderFollows = async (page: Page) => {
    const [y, range, viewport, doc] = await page.evaluate(() => [
      window.scrollY,
      document.documentElement.scrollHeight - window.innerHeight,
      window.innerHeight,
      document.documentElement.scrollHeight,
    ]);
    const track = (await minimap(page).boundingBox())!;
    const thumb = (await slider(page).boundingBox())!;
    const height = Math.max(
      28,
      Math.min(track.height, (viewport / doc) * track.height),
    );
    const top = Math.min(1, y / Math.max(1, range)) * (track.height - height);
    return {
      heightError: Math.abs(thumb.height - height),
      topError: Math.abs(thumb.y - track.y - top),
    };
  };

  test('the slider follows the scroll of the page, and again after the minimap was away', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 800 });
    await gotoSkin(page, '/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const scrollTo = (top: number) =>
      page.evaluate(
        (y) => window.scrollTo({ top: y, behavior: 'instant' }),
        top,
      );
    const follows = async () => {
      await expect
        .poll(async () => (await sliderFollows(page)).topError)
        .toBeLessThan(1.5);
      expect((await sliderFollows(page)).heightError).toBeLessThan(1.5);
    };
    await follows();
    expect((await slider(page).boundingBox())!.height).toBeLessThan(
      (await minimap(page).boundingBox())!.height,
    );
    await scrollTo(400);
    await follows();
    await scrollTo(100000);
    await follows();
    // at the very bottom the slider rests on the bottom of the track
    const track = (await minimap(page).boundingBox())!;
    const thumb = (await slider(page).boundingBox())!;
    expect(
      Math.abs(track.y + track.height - (thumb.y + thumb.height)),
    ).toBeLessThan(1.5);
    await scrollTo(0);
    await follows();

    // while the minimap is hidden (under 1180px) the page scrolls; when it is back the slider is where the page is
    await page.setViewportSize({ width: 1100, height: 800 });
    await expect(minimap(page)).toBeHidden();
    await scrollTo(300);
    await page.setViewportSize({ width: 1440, height: 800 });
    await expect(minimap(page)).toBeVisible();
    await follows();

    // the same for Zen mode, which hides it with CSS and changes the height of the track
    await page.getByRole('button', { name: 'Zen mode', exact: true }).click();
    await expect(minimap(page)).toBeHidden();
    await scrollTo(600);
    await page.keyboard.press('Escape');
    await expect(minimap(page)).toBeVisible();
    await follows();
  });

  test('jumps when the track is clicked, so that the slider is centred there', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const track = (await minimap(page).boundingBox())!;
    await page.mouse.click(track.x + 40, track.y + track.height * 0.6);
    await expect.poll(() => scrollY(page)).toBeGreaterThan(300);
    await expect
      .poll(async () => {
        const thumb = (await slider(page).boundingBox())!;
        return thumb.y + thumb.height / 2;
      })
      .toBeGreaterThan(track.y + track.height * 0.6 - 12);
    await expect
      .poll(async () => {
        const thumb = (await slider(page).boundingBox())!;
        return thumb.y + thumb.height / 2;
      })
      .toBeLessThan(track.y + track.height * 0.6 + 12);
    await page.mouse.click(track.x + 40, track.y + 2);
    await expect.poll(() => scrollY(page)).toBe(0);
  });

  test('jumps at once with reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await gotoSkin(page, '/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const track = (await minimap(page).boundingBox())!;
    await page.mouse.click(track.x + 40, track.y + track.height * 0.6);
    expect(await scrollY(page)).toBeGreaterThan(300);
  });

  test('is not there under 1180px, and does not cover the chat button', async ({
    page,
  }) => {
    await gotoSkin(page, '/');
    const chat = page.locator('[data-slot="dev-chat-fab"]');
    await expect(chat).toBeVisible();
    const c = (await chat.boundingBox())!;
    // the chat button is above the minimap, so the minimap does not take its clicks
    const hit = await page.evaluate(
      ([x, y]) => document.elementFromPoint(x, y)?.closest('button') !== null,
      [c.x + c.width / 2, c.y + c.height / 2],
    );
    expect(hit).toBe(true);
    await page.setViewportSize({ width: 1100, height: 800 });
    await expect(minimap(page)).toBeHidden();
  });
});

test.describe('the line numbers and the caret of the editor', () => {
  const gutter = (page: Page) => page.locator('[data-slot="dev-gutter"]');
  const numberColor = (page: Page, n: number) =>
    gutter(page)
      .locator('span')
      .nth(n - 1)
      .evaluate((el) => getComputedStyle(el).color);

  test('light the number of the line under the pointer, only that one', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 800 });
    await gotoSkin(page, '/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(gutter(page)).toBeVisible();
    expect(await gutter(page).locator('span').count()).toBeGreaterThan(20);
    const box = (await gutter(page).boundingBox())!;
    const x = box.x + box.width + 4;
    const atLine = (n: number) => box.y + 8 + 24 * (n - 1) + 12;
    // the colour of a number nobody points at
    const rest = await settled(() => numberColor(page, 9));
    await page.mouse.move(x, atLine(4));
    await expect.poll(() => numberColor(page, 4)).not.toBe(rest);
    await page.mouse.move(x, atLine(7));
    await expect.poll(() => numberColor(page, 7)).not.toBe(rest);
    await expect.poll(() => numberColor(page, 4)).toBe(rest);
    expect(await numberColor(page, 9)).toBe(rest);
    expect(await numberColor(page, 1)).toBe(rest);
    // leaving the editor puts every number back
    await page.mouse.move(5, 5);
    await expect.poll(() => numberColor(page, 7)).toBe(rest);
  });

  test('a click on the page moves the Ln and Col of the status bar', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 800 });
    await gotoSkin(page, '/');
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
    const status = page.getByText(/^Ln \d+, Col \d+$/);
    await expect(status).toHaveText('Ln 1, Col 1');
    const main = (await page.locator('main').boundingBox())!;
    const gutterBox = (await gutter(page).boundingBox())!;
    const h = (await heading.boundingBox())!;
    const clickX = h.x + 50;
    const clickY = h.y + 5;
    await page.mouse.click(clickX, clickY);
    const line = Math.floor((clickY - gutterBox.y - 8) / 24) + 1;
    const column = Math.floor((clickX - main.x) / 8.1) + 1;
    await expect(status).toHaveText(`Ln ${line}, Col ${column}`);
  });
});
