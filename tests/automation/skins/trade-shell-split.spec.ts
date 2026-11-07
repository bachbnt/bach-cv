/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test, type Page } from '@playwright/test';
import { mockFirestore } from '../support/firestore-mock';
import { gotoSkin, useSkin } from '../support/skin';

test.beforeEach(async ({ page }) => {
  await useSkin(page, 'trade');
  await mockFirestore(page);
});

const chart = (page: Page) => page.getByTestId('tv-chart');
const bars = async (page: Page) =>
  Number(await chart(page).getAttribute('data-candles'));
const height = (page: Page) => page.locator('[data-splitter="horizontal"]');
const width = (page: Page) => page.locator('[data-splitter="vertical"]');
const chartHeight = async (page: Page) =>
  (await chart(page).boundingBox())!.height;
const panelHeight = async (page: Page) =>
  (await page.getByRole('main').boundingBox())!.height;
const watchlistWidth = async (page: Page) =>
  (await page.getByRole('complementary', { name: 'Watchlist' }).boundingBox())!
    .width;
const value = async (l: ReturnType<Page['locator']>, name = 'aria-valuenow') =>
  Number(await l.getAttribute(name));
const stored = (page: Page) =>
  page.evaluate(() =>
    JSON.parse(localStorage.getItem('bach-cv-trade-layout') ?? '{}'),
  );

const ready = async (page: Page, path = '/') => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await gotoSkin(page, path);
  await expect(chart(page)).toHaveAttribute('data-candles', /^[1-9]/);
  await expect(height(page)).toBeVisible();
};

/** Drags a separator by a distance with the mouse, in steps. */
const drag = async (
  page: Page,
  separator: ReturnType<Page['locator']>,
  dx: number,
  dy: number,
) => {
  const box = (await separator.boundingBox())!;
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + dx, y + dy, { steps: 8 });
  await page.mouse.up();
};

test.describe('the divider between the chart and the page', () => {
  test('is a real separator with its value and limits, and the value is the height of the chart', async ({
    page,
  }) => {
    await ready(page);
    const bar = page.getByRole('separator', { name: /^Resize the chart/ });
    await expect(bar).toHaveAttribute('aria-orientation', 'horizontal');
    await expect(bar).toHaveAttribute('tabindex', '0');
    const now = await value(bar);
    const min = await value(bar, 'aria-valuemin');
    const max = await value(bar, 'aria-valuemax');
    expect(min).toBe(220);
    expect(max).toBeGreaterThan(now);
    expect(Math.abs((await chartHeight(page)) - now)).toBeLessThanOrEqual(1);
    // the page panel keeps at least 160 px at the biggest chart
    expect(await panelHeight(page)).toBeGreaterThan(160);
  });

  test('dragging it down gives the chart more height and the page less, and the chart redraws', async ({
    page,
  }) => {
    await ready(page);
    const chartBefore = await chartHeight(page);
    const panelBefore = await panelHeight(page);
    const candles = await bars(page);
    await drag(page, height(page), 0, 120);
    await expect
      .poll(async () => (await chartHeight(page)) - chartBefore)
      .toBeGreaterThan(100);
    expect(
      Math.abs((await chartHeight(page)) - chartBefore - 120),
    ).toBeLessThan(6);
    expect(panelBefore - (await panelHeight(page))).toBeGreaterThan(100);
    // the chart measured itself again: it still draws, and nothing overflows
    expect(await bars(page)).toBe(candles);
    await expect(page.locator('[data-series="candles"] path')).toHaveCount(4);
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <= innerWidth &&
          document.documentElement.scrollHeight <= innerHeight + 1,
      ),
    ).toBe(true);
    // the page behind the drag did not select anything
    expect(await page.evaluate(() => window.getSelection()?.toString())).toBe(
      '',
    );
    expect(await page.evaluate(() => document.body.style.userSelect)).toBe('');
  });

  test('never makes the chart or the page too small', async ({ page }) => {
    await ready(page);
    await drag(page, height(page), 0, 900);
    const biggest = await chartHeight(page);
    expect(await panelHeight(page)).toBeGreaterThanOrEqual(155);
    await drag(page, height(page), 0, -1200);
    const smallest = await chartHeight(page);
    expect(smallest).toBeGreaterThanOrEqual(218);
    expect(smallest).toBeLessThan(biggest - 200);
    expect(await value(height(page))).toBe(220);
    // the toolbar and the tape are not pushed out
    await expect(page.getByRole('banner')).toBeInViewport();
    await expect(
      page.getByRole('region', { name: /^Ticker tape/ }),
    ).toBeInViewport();
  });

  test('moves with the arrow keys, goes to its limits, and Enter or a double click puts it back', async ({
    page,
  }) => {
    await ready(page);
    const bar = height(page);
    const usual = await value(bar);
    await bar.focus();
    await page.keyboard.press('ArrowDown');
    await expect.poll(() => value(bar)).toBe(usual + 24);
    await page.keyboard.press('Shift+ArrowDown');
    await expect.poll(() => value(bar)).toBe(usual + 24 + 96);
    await page.keyboard.press('ArrowUp');
    await expect.poll(() => value(bar)).toBe(usual + 96);
    await expect
      .poll(async () => Math.abs((await chartHeight(page)) - (usual + 96)))
      .toBeLessThanOrEqual(1);
    await page.keyboard.press('End');
    await expect.poll(() => value(bar)).toBe(await value(bar, 'aria-valuemax'));
    await page.keyboard.press('Home');
    await expect.poll(() => value(bar)).toBe(220);
    await page.keyboard.press('Enter');
    await expect.poll(() => value(bar)).toBe(usual);
    await page.keyboard.press('Shift+ArrowDown');
    await expect.poll(() => value(bar)).toBe(usual + 96);
    await bar.dblclick();
    await expect.poll(() => value(bar)).toBe(usual);
    // a reset is the usual size again, and is not kept as a size of its own
    await expect
      .poll(async () => (await stored(page)).split ?? null)
      .toBeNull();
  });

  test('is kept after a reload, as a share of the window', async ({ page }) => {
    await ready(page);
    await drag(page, height(page), 0, 90);
    const after = await chartHeight(page);
    const split = (await stored(page)).split;
    expect(split).toBeGreaterThan(0.1);
    expect(split).toBeLessThan(0.9);
    await page.reload();
    await expect(chart(page)).toHaveAttribute('data-candles', /^[1-9]/);
    await expect
      .poll(async () => Math.abs((await chartHeight(page)) - after))
      .toBeLessThanOrEqual(2);
    // a smaller window keeps the share and stays valid
    await page.setViewportSize({ width: 1440, height: 640 });
    await expect.poll(async () => (await panelHeight(page)) >= 155).toBe(true);
    expect(await chartHeight(page)).toBeGreaterThanOrEqual(218);
  });

  test('ignores a size in the browser that is not valid', async ({ page }) => {
    await page.addInitScript(() =>
      localStorage.setItem(
        'bach-cv-trade-layout',
        JSON.stringify({ split: 7, side: 'wide' }),
      ),
    );
    await ready(page);
    expect(await value(height(page))).toBeLessThan(400);
    expect(await value(width(page))).toBe(300);
  });

  test('leaves the chart working: the wheel zooms, a drag pans and the replay starts', async ({
    page,
  }) => {
    await ready(page);
    await drag(page, height(page), 0, 80);
    const all = await bars(page);
    const box = (await chart(page).boundingBox())!;
    await page.mouse.move(box.x + box.width * 0.4, box.y + box.height * 0.3);
    for (let i = 0; i < 5; i++) await page.mouse.wheel(0, -100);
    await expect.poll(() => bars(page)).toBeLessThan(all * 0.8);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.3, {
      steps: 6,
    });
    await page.mouse.up();
    await page.getByRole('button', { name: 'Bar replay' }).first().click();
    await page.mouse.click(box.x + box.width * 0.3, box.y + box.height * 0.3);
    await expect(page.locator('[data-playhead="ready"]')).toBeAttached();
  });

  test('has no divider with the panel hidden, and the Layout menu puts everything back', async ({
    page,
  }) => {
    await ready(page);
    await drag(page, height(page), 0, 100);
    await drag(page, width(page), -90, 0);
    await page
      .getByRole('button', { name: 'Choose what the terminal shows' })
      .click();
    await page.getByRole('menuitemcheckbox', { name: 'Ticker tape' }).click();
    const saved = await stored(page);
    expect(saved.split).not.toBeNull();
    expect(saved.side).toBeGreaterThan(300);
    expect(saved.tape).toBe(false);
    // the menu stays open after a check: the reset is in it
    await page.getByTestId('tv-reset-layout').click();
    await expect
      .poll(async () => (await stored(page)).split ?? null)
      .toBeNull();
    const back = await stored(page);
    expect(back.side ?? null).toBeNull();
    expect(back.tape).toBe(true);
    expect(back.panel).toBe(true);
    await expect(
      page.getByRole('region', { name: /^Ticker tape/ }),
    ).toBeVisible();
    await expect.poll(() => watchlistWidth(page)).toBeLessThan(310);
    // with the panel off there is nothing to divide
    await page
      .getByRole('button', { name: 'Choose what the terminal shows' })
      .click();
    await page.getByRole('menuitemcheckbox', { name: 'Page panel' }).click();
    await expect(height(page)).toHaveCount(0);
  });
});

test.describe('the divider between the workspace and the watchlist', () => {
  test('is a vertical separator, and dragging it left widens the watchlist', async ({
    page,
  }) => {
    await ready(page);
    const bar = page.getByRole('separator', { name: /^Resize the watchlist/ });
    await expect(bar).toHaveAttribute('aria-orientation', 'vertical');
    expect(await value(bar)).toBe(300);
    expect(await value(bar, 'aria-valuemin')).toBe(240);
    expect(await value(bar, 'aria-valuemax')).toBe(480);
    const wider = await watchlistWidth(page);
    await drag(page, bar, -100, 0);
    await expect
      .poll(async () => (await watchlistWidth(page)) - wider)
      .toBeGreaterThan(90);
    expect(Math.abs((await watchlistWidth(page)) - wider - 100)).toBeLessThan(
      8,
    );
    // the chart is narrower and still draws
    await expect(page.locator('[data-series="candles"] path')).toHaveCount(4);
    expect((await stored(page)).side).toBeGreaterThan(380);
    // never wider than 480 or narrower than 240
    await drag(page, bar, -900, 0);
    expect(await watchlistWidth(page)).toBeLessThanOrEqual(482);
    await drag(page, bar, 900, 0);
    expect(await watchlistWidth(page)).toBeGreaterThanOrEqual(238);
  });

  test('moves with the arrows, Home, End and Enter, and is kept after a reload', async ({
    page,
  }) => {
    await ready(page);
    const bar = width(page);
    await bar.focus();
    // the arrow moves the divider: left makes the watchlist wider
    await page.keyboard.press('ArrowLeft');
    await expect.poll(() => value(bar)).toBe(324);
    await page.keyboard.press('Shift+ArrowRight');
    await expect.poll(() => value(bar)).toBe(228 < 240 ? 240 : 228);
    await page.keyboard.press('Home');
    await expect.poll(() => value(bar)).toBe(480);
    await page.keyboard.press('End');
    await expect.poll(() => value(bar)).toBe(240);
    await page.keyboard.press('ArrowLeft');
    await expect.poll(() => value(bar)).toBe(264);
    await page.reload();
    await expect(chart(page)).toHaveAttribute('data-candles', /^[1-9]/);
    expect(await value(width(page))).toBe(264);
    await width(page).focus();
    await page.keyboard.press('Enter');
    await expect.poll(() => value(width(page))).toBe(300);
    await expect.poll(async () => (await stored(page)).side ?? null).toBeNull();
  });
});

test.describe('in Vietnamese', () => {
  test('the dividers are named in Vietnamese', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
    await ready(page);
    await expect(
      page.getByRole('separator', { name: /^Đổi cỡ biểu đồ và trang/ }),
    ).toHaveAttribute('aria-orientation', 'horizontal');
    await expect(
      page.getByRole('separator', { name: /^Đổi cỡ danh sách theo dõi/ }),
    ).toHaveAttribute('aria-orientation', 'vertical');
  });
});

test.describe('without motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('a key moves the divider at once, with no transition', async ({
    page,
  }) => {
    await ready(page);
    await height(page).focus();
    await page.keyboard.press('ArrowDown');
    const root = page.locator('[data-skin-root="trade"]').first();
    await expect(root).not.toHaveClass(/transition-\[/);
    await expect.poll(() => value(height(page))).toBeGreaterThan(0);
  });
});

test.describe('on a phone', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  test('there is no divider: the layout is a column', async ({ page }) => {
    await gotoSkin(page, '/');
    await expect(chart(page)).toHaveAttribute('data-candles', /^[1-9]/);
    await expect(page.getByRole('separator')).toHaveCount(0);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
});
