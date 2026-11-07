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
const volume = (page: Page) => page.locator('[data-indicator="volume"]');
const row = (page: Page) => page.locator('[data-legend-row="volume"]');

const ready = async (page: Page, path = '/') => {
  await gotoSkin(page, path);
  await expect(chart(page)).toHaveAttribute('data-candles', /^[1-9]/);
  await expect(volume(page)).toBeAttached();
  await page.waitForTimeout(1300);
};

/** The height of the histogram and of the plot it stands in, in pixels. */
const heights = async (page: Page) => {
  const bars = await volume(page)
    .locator('g > path')
    .evaluateAll((list) =>
      list.map((el) => (el as SVGGraphicsElement).getBBox().height),
    );
  const svg = (await chart(page).boundingBox())!;
  return { tallest: Math.max(...bars), plot: svg.height - 24 };
};

test.describe('the volume', () => {
  test('is a histogram of about a quarter of the price pane, in two paths, coloured by the candle', async ({
    page,
  }) => {
    await ready(page);
    const { tallest, plot } = await heights(page);
    // the biggest bar on screen reaches about 24 percent of the pane
    expect(tallest / plot).toBeGreaterThan(0.18);
    expect(tallest / plot).toBeLessThan(0.3);
    const paths = volume(page).locator('g > path');
    await expect(paths).toHaveCount(2);
    for (const path of await paths.all())
      expect((await path.getAttribute('d'))!.length).toBeGreaterThan(50);
    // solid enough to read: half opaque, in the up and the down colours of the skin
    await expect(volume(page).locator('g').first()).toHaveAttribute(
      'opacity',
      '0.5',
    );
    await expect(paths.nth(0)).toHaveClass(/fill-tv-up/);
    await expect(paths.nth(1)).toHaveClass(/fill-tv-down/);
    // cheap: a handful of nodes whatever the number of bars
    expect(
      await volume(page).evaluate((el) => el.querySelectorAll('*').length),
    ).toBeLessThanOrEqual(6);
  });

  test('shows on a page with a thin chart too, smaller but visible', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await ready(page, '/about');
    const { tallest, plot } = await heights(page);
    expect(plot).toBeLessThan(260);
    expect(tallest).toBeGreaterThan(30);
    expect(tallest / plot).toBeGreaterThan(0.18);
  });

  test('has an average of 20 bars as a thin line, and a label of the last volume on the scale', async ({
    page,
  }) => {
    await ready(page);
    const line = volume(page).locator('path.stroke-tv-orange');
    await expect(line).toHaveCount(1);
    expect((await line.getAttribute('d'))!.length).toBeGreaterThan(50);
    await expect(line).toHaveAttribute('stroke-width', '1');
    const tag = page.getByTestId('tv-volume-tag');
    await expect(tag).toBeAttached();
    expect(await tag.textContent()).toMatch(/^\d+(\.\d)?[KMB]?$/);
  });

  test('is in the legend as a short number coloured by the bar, with the average beside it', async ({
    page,
  }) => {
    await ready(page);
    // the last bar and its average
    await expect(row(page)).toContainText('Vol');
    const numbers = row(page).locator('b');
    await expect(numbers).toHaveCount(2);
    for (const n of await numbers.all())
      expect(await n.textContent()).toMatch(/^\d+(\.\d)?[KM]?$/);
    // no unit of money or shares
    expect(await row(page).innerText()).not.toMatch(/\$|€|shares|USD/i);
    // under the crosshair it is that bar's volume: it changes with the pointer
    const before = await row(page).innerText();
    const box = (await chart(page).boundingBox())!;
    await page.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.3);
    await expect.poll(() => row(page).innerText()).not.toBe(before);
    const value = row(page).locator('b').first();
    expect(await value.getAttribute('class')).toMatch(/text-tv-(up|down)/);
    // the bar under the crosshair is lit
    await expect(volume(page).locator('rect')).toHaveCount(1);
  });

  test('can be removed from its legend row and comes back from the Indicators window', async ({
    page,
  }) => {
    await ready(page);
    await row(page)
      .getByRole('button', { name: /^Remove/ })
      .click();
    await expect(volume(page)).toHaveCount(0);
    await expect(page.getByTestId('tv-volume-tag')).toHaveCount(0);
    await page.getByRole('button', { name: 'Indicators' }).first().click();
    await page.getByRole('switch', { name: /^Volume/ }).click();
    await page.keyboard.press('Escape');
    await expect(volume(page)).toBeAttached();
  });

  test('is there for every chart type and every interval, with wide bars on yearly candles', async ({
    page,
  }) => {
    await ready(page);
    for (const type of [
      'Candles',
      'Hollow candles',
      'Bars',
      'Heikin Ashi',
      'Line',
      'Area',
      'Baseline',
    ]) {
      await page.getByTestId('tv-type-menu').click();
      await page
        .getByRole('menuitemradio', { name: type, exact: true })
        .click();
      await expect(volume(page)).toBeAttached();
      await expect(volume(page).locator('g > path')).toHaveCount(2);
    }
    const group = page.getByRole('group', { name: 'Interval' });
    for (const name of ['Week (1W)', 'Quarter (3M)', 'Year (1Y)']) {
      await group.getByRole('button', { name }).click();
      await expect(group.getByRole('button', { name })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
      // the old picture has faded out: one histogram is left
      await expect(volume(page)).toHaveCount(1);
      const { tallest, plot } = await heights(page);
      expect(tallest / plot).toBeGreaterThan(0.15);
    }
    // seven yearly bars: wide, with a gap between them
    const widest = await volume(page)
      .locator('g > path')
      .first()
      .evaluate((el) => (el as SVGGraphicsElement).getBBox().width);
    expect(widest).toBeGreaterThan(400);
    // too few bars for an average of 20: no line, and no value of it in the legend
    await expect(volume(page).locator('path.stroke-tv-orange')).toHaveCount(0);
  });

  test('is cut at the playhead of a replay', async ({ page }) => {
    await ready(page);
    const full = (await volume(page)
      .locator('g > path')
      .first()
      .boundingBox())!;
    await page.getByRole('button', { name: 'Bar replay' }).first().click();
    const box = (await chart(page).boundingBox())!;
    await page.mouse.click(box.x + box.width * 0.4, box.y + box.height * 0.3);
    await expect(page.locator('[data-playhead="ready"]')).toBeAttached();
    const cut = (await volume(page).locator('g > path').first().boundingBox())!;
    expect(cut.x + cut.width).toBeLessThan(full.x + full.width - 100);
  });

  test('reads in the light and the dark themes: the bars are coloured and half opaque', async ({
    page,
  }) => {
    for (const scheme of ['dark', 'light'] as const) {
      await page.emulateMedia({ colorScheme: scheme });
      await ready(page);
      const fill = await volume(page)
        .locator('g > path')
        .first()
        .evaluate((el) => getComputedStyle(el).fill);
      expect(fill).not.toMatch(/none|rgba\(0, 0, 0, 0\)/);
      await page.reload();
    }
  });
});

/** The heights of the bars of the histogram, read from the paths that draw them (each bar is `M x base v-height h width v height z`). */
const barHeights = async (page: Page) => {
  const paths = await volume(page)
    .locator('g > path')
    .evaluateAll((list) => list.map((el) => el.getAttribute('d') ?? ''));
  return paths
    .flatMap((d) => [...d.matchAll(/v-([\d.]+)h/g)].map((m) => Number(m[1])))
    .filter((h) => h > 0);
};

test.describe('the heights of the volume bars', () => {
  const spread = (heights: number[]) => {
    const mean = heights.reduce((a, b) => a + b, 0) / heights.length;
    const sd = Math.sqrt(
      heights.reduce((a, b) => a + (b - mean) ** 2, 0) / heights.length,
    );
    return {
      ratio: Math.max(...heights) / Math.min(...heights),
      variation: sd / mean,
    };
  };

  test('vary a lot at the monthly default on Home and on a page with a thin chart: never equal bars', async ({
    page,
  }) => {
    for (const path of ['/', '/about']) {
      await ready(page, path);
      const heights = await barHeights(page);
      expect(heights.length).toBeGreaterThan(60);
      const { ratio, variation } = spread(heights);
      // the tallest bar is at least four times the shortest one, and the bars are far from alike
      expect(ratio).toBeGreaterThan(4);
      expect(variation).toBeGreaterThan(0.3);
      // there are quiet bars and spikes: the tallest is well above the typical one
      const sorted = [...heights].sort((a, b) => a - b);
      expect(
        sorted.at(-1)! / sorted[Math.floor(sorted.length / 2)],
      ).toBeGreaterThan(1.8);
    }
  });

  test('still vary on weeks, quarters and years', async ({ page }) => {
    await ready(page);
    const group = page.getByRole('group', { name: 'Interval' });
    for (const [name, min] of [
      ['Week (1W)', 8],
      ['Quarter (3M)', 2.5],
      ['Year (1Y)', 1.3],
    ] as const) {
      await group.getByRole('button', { name }).click();
      await expect(volume(page)).toHaveCount(1);
      const { ratio } = spread(await barHeights(page));
      expect(ratio).toBeGreaterThan(min);
    }
  });

  test('are not hidden by a divider that was dragged, nor by the panes of other indicators', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await ready(page);
    const divider = page.locator('[data-splitter="horizontal"]');
    await divider.focus();
    await page.keyboard.press('Shift+ArrowUp');
    await page.keyboard.press('Shift+ArrowUp');
    await expect
      .poll(() => heights(page).then((h) => h.plot))
      .toBeLessThan(330);
    const { tallest, plot } = await heights(page);
    expect(tallest).toBeGreaterThan(40);
    expect(tallest / plot).toBeGreaterThan(0.15);
    // with the RSI and MACD panes the price pane is smaller and the volume is still its quarter
    await page.getByRole('button', { name: 'Indicators' }).click();
    await page.getByRole('switch', { name: /^Relative Strength/ }).click();
    await page.getByRole('switch', { name: /^MACD/ }).click();
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-indicator="macd"]')).toBeAttached();
    const { ratio } = spread(await barHeights(page));
    expect(ratio).toBeGreaterThan(4);
    expect((await heights(page)).tallest).toBeGreaterThan(25);
  });
});

test.describe('in Vietnamese', () => {
  test('uses the same short number', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
    await ready(page);
    await expect(row(page)).toContainText('KL');
    for (const n of await row(page).locator('b').all())
      expect(await n.textContent()).toMatch(/^\d+(\.\d)?[KM]?$/);
    expect(await page.getByTestId('tv-volume-tag').textContent()).toMatch(
      /^\d+(\.\d)?[KMB]?$/,
    );
  });
});
