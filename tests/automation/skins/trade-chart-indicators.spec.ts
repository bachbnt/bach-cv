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
const line = (page: Page, id: string) =>
  page.locator(`[data-indicator="${id}"] path`);
const rowOf = (page: Page, id: string) =>
  page.locator(`[data-legend-row="${id}"]`);
const dialog = (page: Page) => page.getByTestId('tv-indicators');
const toggle = (page: Page, id: string) =>
  dialog(page).locator(`[data-indicator-switch="${id}"]`);
const interval = (page: Page, name: string) =>
  page.getByRole('group', { name: 'Interval' }).getByRole('button', { name });

const ready = async (page: Page, path = '/') => {
  await gotoSkin(page, path);
  await expect(chart(page)).toHaveAttribute('data-candles', /^[1-9]/);
  await page.waitForTimeout(1300);
};
const open = async (page: Page) => {
  await page.getByTestId('tv-indicators-button').click();
  await expect(dialog(page)).toBeVisible();
};

test.describe('the indicators of a first visit', () => {
  test('the chart already shows the volume, MA 20 and EMA 50, drawn, with a row each in the legend', async ({
    page,
  }) => {
    for (const path of ['/', '/about']) {
      await ready(page, path);
      for (const id of ['ma20', 'ema50']) {
        await expect(line(page, id)).toHaveCount(1);
        expect(
          (await line(page, id).getAttribute('d'))!.length,
        ).toBeGreaterThan(100);
        // the line draws in with the stroke animation
        await expect(line(page, id)).toHaveClass(/tv-chart-line-in/);
      }
      await expect(rowOf(page, 'volume')).toBeVisible();
      await expect(rowOf(page, 'ma20')).toContainText('MA 20');
      await expect(rowOf(page, 'ema50')).toContainText('EMA 50');
      // with a value under the crosshair
      expect(await rowOf(page, 'ma20').innerText()).toMatch(/\d/);
      // the lines they would otherwise need are not there
      await expect(page.locator('[data-indicator="ma100"]')).toHaveCount(0);
      await expect(page.locator('[data-indicator="ma200"]')).toHaveCount(0);
    }
  });

  test('the Indicators button says how many are on, and the number follows the switches', async ({
    page,
  }) => {
    await ready(page);
    const button = page.getByTestId('tv-indicators-button');
    await expect(page.getByTestId('tv-indicators-count')).toHaveText('3');
    await expect(button).toHaveAttribute('aria-label', 'Indicators: 3 on');
    await open(page);
    await toggle(page, 'ma50').click();
    await expect(page.getByTestId('tv-indicators-count')).toHaveText('4');
    await toggle(page, 'volume').click();
    await toggle(page, 'ma20').click();
    await toggle(page, 'ema50').click();
    await toggle(page, 'ma50').click();
    await expect(page.getByTestId('tv-indicators-count')).toHaveCount(0);
    await expect(button).toHaveAttribute('aria-label', 'Indicators');
  });

  test('a stored choice wins over the first visit, and one that is not an indicator is ignored', async ({
    page,
  }) => {
    await page.addInitScript(() =>
      localStorage.setItem(
        'bach-cv-trade-chart',
        JSON.stringify({
          interval: 'month',
          indicators: {
            ma20: 'off',
            ema50: 'off',
            ma50: 'shown',
            ema21: 'shown',
          },
        }),
      ),
    );
    await ready(page);
    await expect(line(page, 'ma50')).toHaveCount(1);
    await expect(page.locator('[data-indicator="ma20"]')).toHaveCount(0);
    await expect(page.locator('[data-indicator="ema50"]')).toHaveCount(0);
    await expect(page.getByTestId('tv-indicators-count')).toHaveText('2');
  });

  test('the choice is kept after a reload', async ({ page }) => {
    await ready(page);
    await open(page);
    await toggle(page, 'ma50').click();
    await toggle(page, 'ema20').click();
    await page.keyboard.press('Escape');
    const saved = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('bach-cv-trade-chart') ?? '{}'),
    );
    expect(saved.indicators.ma50).toBe('shown');
    expect(saved.indicators.ema20).toBe('shown');
    await page.reload();
    await expect(chart(page)).toHaveAttribute('data-candles', /^[1-9]/);
    await expect(line(page, 'ma50')).toHaveCount(1);
    await expect(line(page, 'ema20')).toHaveCount(1);
    await expect(page.getByTestId('tv-indicators-count')).toHaveText('5');
  });
});

test.describe('the Indicators window', () => {
  test('has a search field and the four groups, with a switch for each of the twelve', async ({
    page,
  }) => {
    await ready(page);
    await open(page);
    await expect(
      dialog(page).getByRole('searchbox', { name: 'Search indicators' }),
    ).toBeVisible();
    for (const [group, count] of [
      ['moving', 8],
      ['volatility', 1],
      ['oscillators', 2],
      ['volume', 1],
    ] as const)
      await expect(
        dialog(page).locator(`[data-group="${group}"] [role="switch"]`),
      ).toHaveCount(count);
    for (const title of [
      'Moving averages',
      'Volatility',
      'Oscillators',
      'Volume',
    ])
      await expect(
        dialog(page).getByRole('heading', { name: title }),
      ).toBeVisible();
    await expect(dialog(page).getByRole('switch')).toHaveCount(12);
  });

  test('the search filters the list, by name or by short name, and says when nothing matches', async ({
    page,
  }) => {
    await ready(page);
    await open(page);
    const search = dialog(page).getByRole('searchbox');
    await search.fill('rsi');
    await expect(dialog(page).getByRole('switch')).toHaveCount(1);
    await expect(toggle(page, 'rsi')).toBeVisible();
    await search.fill('ema');
    await expect(dialog(page).getByRole('switch')).toHaveCount(4);
    await search.fill('moving average');
    await expect(dialog(page).getByRole('switch')).toHaveCount(8);
    await search.fill('200');
    await expect(dialog(page).getByRole('switch')).toHaveCount(2);
    await search.fill('zzz');
    await expect(dialog(page).getByRole('switch')).toHaveCount(0);
    await expect(dialog(page).getByText('No indicator matches.')).toBeVisible();
    await search.fill('');
    await expect(dialog(page).getByRole('switch')).toHaveCount(12);
  });

  test('an average of 100 bars says what it needs on 80 monthly candles, draws nothing there, and draws on weeks', async ({
    page,
  }) => {
    await ready(page);
    await open(page);
    // it can be switched on, and says why there is nothing to see
    await expect(
      toggle(page, 'ma100').getByTestId('tv-indicator-note'),
    ).toHaveText('Needs 100 bars. Enough bars on 1W.');
    await expect(
      toggle(page, 'ma200').getByTestId('tv-indicator-note'),
    ).toHaveText('Needs 200 bars. Enough bars on 1W.');
    // the ones that have enough say nothing
    await expect(
      toggle(page, 'ma50').getByTestId('tv-indicator-note'),
    ).toHaveCount(0);
    await toggle(page, 'ma100').click();
    await page.keyboard.press('Escape');
    // no garbage: no line and no row for it at 1M
    await expect(page.locator('[data-indicator="ma100"]')).toHaveCount(0);
    await expect(rowOf(page, 'ma100')).toHaveCount(0);
    // the weekly interval has the bars: the line is drawn
    await interval(page, 'Week (1W)').click();
    await expect(line(page, 'ma100')).toHaveCount(1);
    expect(
      (await line(page, 'ma100').getAttribute('d'))!.length,
    ).toBeGreaterThan(100);
    await expect(rowOf(page, 'ma100')).toContainText('MA 100');
    // and the window no longer has a note for it
    await open(page);
    await expect(
      toggle(page, 'ma100').getByTestId('tv-indicator-note'),
    ).toHaveCount(0);
    await expect(
      toggle(page, 'ma200').getByTestId('tv-indicator-note'),
    ).toHaveCount(0);
    await page.keyboard.press('Escape');
    // back on months it goes again, and the choice is kept
    await interval(page, 'Month (1M)').click();
    await expect(page.locator('[data-indicator="ma100"]')).toHaveCount(0);
    await expect(page.getByTestId('tv-indicators-count')).toHaveText('4');
  });

  test('every average has a colour of its own on the chart', async ({
    page,
  }) => {
    await page.addInitScript(() =>
      localStorage.setItem(
        'bach-cv-trade-chart',
        JSON.stringify({
          interval: 'week',
          indicators: Object.fromEntries(
            [
              'ma20',
              'ma50',
              'ma100',
              'ma200',
              'ema20',
              'ema50',
              'ema100',
              'ema200',
            ].map((id) => [id, 'shown']),
          ),
        }),
      ),
    );
    await ready(page);
    const colours = new Set<string>();
    for (const id of [
      'ma20',
      'ma50',
      'ma100',
      'ma200',
      'ema20',
      'ema50',
      'ema100',
      'ema200',
    ]) {
      await expect(line(page, id)).toHaveCount(1);
      colours.add(
        await line(page, id).evaluate((el) => getComputedStyle(el).stroke),
      );
    }
    expect(colours.size).toBe(8);
  });

  test('the lines survive every chart type, follow the interval and are cut by the replay', async ({
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
      await expect(line(page, 'ma20')).toHaveCount(1);
      await expect(line(page, 'ema50')).toHaveCount(1);
    }
    // on yearly candles there are fewer than 20 bars: nothing is drawn, and nothing breaks
    await interval(page, 'Year (1Y)').click();
    await expect(interval(page, 'Year (1Y)')).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(page.locator('[data-indicator="ma20"]')).toHaveCount(0);
    await interval(page, 'Week (1W)').click();
    await expect(line(page, 'ma20')).toHaveCount(1);
    // the replay shows the line only as far as the playhead
    const full = (await line(page, 'ma20').boundingBox())!;
    await page.getByRole('button', { name: 'Bar replay' }).first().click();
    const box = (await chart(page).boundingBox())!;
    await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.1);
    await expect(page.locator('[data-playhead="ready"]')).toBeAttached();
    const cut = (await line(page, 'ma20').boundingBox())!;
    expect(cut.x + cut.width).toBeLessThan(full.x + full.width - 100);
  });
});

test.describe('in Vietnamese', () => {
  test('the window, the groups and the note are in Vietnamese', async ({
    page,
  }) => {
    await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
    await ready(page);
    await open(page);
    await expect(
      dialog(page).getByRole('searchbox', { name: 'Tìm chỉ báo' }),
    ).toBeVisible();
    await expect(
      dialog(page).getByRole('heading', { name: 'Đường trung bình' }),
    ).toBeVisible();
    await expect(
      toggle(page, 'ma100').getByTestId('tv-indicator-note'),
    ).toHaveText('Cần 100 nến. Đủ nến ở 1W.');
    await expect(page.getByTestId('tv-indicators-button')).toHaveAttribute(
      'aria-label',
      /3 đang bật/,
    );
    await dialog(page).getByRole('searchbox').fill('zzz');
    await expect(
      dialog(page).getByText('Không có chỉ báo nào khớp.'),
    ).toBeVisible();
  });
});

test.describe('on a phone', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  test('the lines and the rows are there, the button shows its count, and the window fits', async ({
    page,
  }) => {
    await ready(page);
    await expect(line(page, 'ma20')).toHaveCount(1);
    await expect(line(page, 'ema50')).toHaveCount(1);
    await expect(rowOf(page, 'ma20')).toBeVisible();
    const button = page.getByTestId('tv-indicators-button');
    await button.scrollIntoViewIfNeeded();
    await expect(page.getByTestId('tv-indicators-count')).toHaveText('3');
    const b = (await button.boundingBox())!;
    expect(b.height).toBeGreaterThanOrEqual(43.5);
    await button.tap();
    const box = (await dialog(page).boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(391);
    await expect(dialog(page).getByRole('searchbox')).toBeVisible();
    await dialog(page).getByRole('searchbox').fill('ema');
    await expect(dialog(page).getByRole('switch')).toHaveCount(4);
    await toggle(page, 'ema20').tap();
    await expect(toggle(page, 'ema20')).toHaveAttribute('aria-checked', 'true');
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
});
