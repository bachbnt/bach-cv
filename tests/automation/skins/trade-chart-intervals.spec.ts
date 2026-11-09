/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test, type Page } from '@playwright/test';
import { mockFirestore } from '../support/firestore-mock';
import { gotoSkin, useSkin } from '../support/skin';

test.beforeEach(async ({ page }) => {
  await useSkin(page, 'trade');
  // most of these tests count weekly candles: the chart opens on months unless the visitor has chosen another interval
  await page.addInitScript(() => {
    if (!localStorage.getItem('bach-cv-trade-chart'))
      localStorage.setItem(
        'bach-cv-trade-chart',
        JSON.stringify({ interval: 'week' }),
      );
  });
  await mockFirestore(page);
});

const chart = (page: Page) => page.getByTestId('tv-chart');
const bars = async (page: Page) =>
  Number(await chart(page).getAttribute('data-candles'));
const legend = (page: Page) => page.getByTestId('tv-legend');
const legendDate = (page: Page) => page.getByTestId('tv-legend-date');
const group = (page: Page, name = 'Interval') =>
  page.getByRole('group', { name });
const ranges = (page: Page) => page.getByRole('group', { name: 'Time range' });
const flags = (page: Page) => page.locator('[data-marker]');

const NAMES = {
  week: 'Week (1W)',
  month: 'Month (1M)',
  quarter: 'Quarter (3M)',
  year: 'Year (1Y)',
} as const;
const pick = (page: Page, key: keyof typeof NAMES) =>
  group(page).getByRole('button', { name: NAMES[key] });

const ready = async (page: Page, path = '/') => {
  await gotoSkin(page, path);
  await expect(chart(page)).toHaveAttribute('data-candles', /^[1-9]/);
};

/** The date the legend tells for the bar under the pointer at a share of the chart's width. */
const dateAt = async (page: Page, share: number) => {
  const box = (await chart(page).boundingBox())!;
  await page.mouse.move(box.x + box.width * share, box.y + box.height * 0.3);
  return legendDate(page).locator('span').first().innerText();
};

test.describe('a visitor who has chosen nothing', () => {
  test('opens on monthly candles, the whole career, with 1W, 3M and 1Y one click away', async ({
    page,
  }) => {
    // the file's own seed asks for weeks: a new visitor has nothing stored
    await page.addInitScript(() =>
      localStorage.removeItem('bach-cv-trade-chart'),
    );
    await ready(page);
    await expect(pick(page, 'month')).toHaveAttribute('aria-pressed', 'true');
    await expect(legend(page)).toContainText('1M');
    await expect(chart(page)).toHaveAttribute('aria-label', /for each month/);
    // March 2020 (the first job) to now: about 80 candles, all of them on screen
    expect(await bars(page)).toBeGreaterThan(70);
    expect(await bars(page)).toBeLessThan(90);
    await expect(
      ranges(page).getByRole('button', { name: 'All' }),
    ).toHaveAttribute('aria-pressed', 'true');
    // the legend dates a month, and the axis names years
    await expect.poll(() => dateAt(page, 0.5)).toMatch(/^[A-Z][a-z]{2} 20\d\d/);
    await expect(flags(page)).toHaveCount(4);
    for (const flag of await flags(page).all())
      await expect(flag).toBeVisible();
    for (const key of ['week', 'quarter', 'year'] as const) {
      await pick(page, key).click();
      await expect(pick(page, key)).toHaveAttribute('aria-pressed', 'true');
    }
  });
});

test('the interval selector sits in the toolbar with the current interval pressed', async ({
  page,
}) => {
  await ready(page);
  await expect(group(page)).toBeVisible();
  await expect(group(page).getByRole('button')).toHaveCount(4);
  await expect(pick(page, 'week')).toHaveAttribute('aria-pressed', 'true');
  for (const key of ['month', 'quarter', 'year'] as const)
    await expect(pick(page, key)).toHaveAttribute('aria-pressed', 'false');
  await expect(pick(page, 'week')).toHaveText('1W');
  await expect(pick(page, 'quarter')).toHaveText('3M');
  await expect(legend(page)).toContainText('1W');
  // it is a real button: the keyboard reaches it
  await pick(page, 'month').focus();
  await page.keyboard.press('Enter');
  await expect(pick(page, 'month')).toHaveAttribute('aria-pressed', 'true');
  await expect(pick(page, 'week')).toHaveAttribute('aria-pressed', 'false');
});

test('each interval draws fewer, larger candles, and the legend and the name of the chart follow', async ({
  page,
}) => {
  await ready(page);
  const weeks = await bars(page);
  expect(weeks).toBeGreaterThan(300);
  const counts = [weeks];
  for (const [key, short, each] of [
    ['month', '1M', 'one candle for each month'],
    ['quarter', '3M', 'one candle for each quarter'],
    ['year', '1Y', 'one candle for each year'],
  ] as const) {
    await pick(page, key).click();
    await expect(pick(page, key)).toHaveAttribute('aria-pressed', 'true');
    await expect(legend(page)).toContainText(short);
    await expect(chart(page)).toHaveAttribute('aria-label', new RegExp(each));
    await expect.poll(() => bars(page)).toBeLessThan(counts[counts.length - 1]);
    counts.push(await bars(page));
  }
  // the whole career, from March 2020 to now, is seven calendar years, about 27 quarters and 80 months
  expect(counts[1]).toBeGreaterThan(70);
  expect(counts[1]).toBeLessThan(90);
  expect(counts[2]).toBeGreaterThan(24);
  expect(counts[2]).toBeLessThan(32);
  expect(counts[3]).toBeGreaterThanOrEqual(6);
  expect(counts[3]).toBeLessThanOrEqual(8);
  // the name still says what it is
  const name = await chart(page).getAttribute('aria-label');
  expect(name).toContain('derived from my real jobs');
  expect(name).not.toMatch(/\$|€|buy|sell|%/i);
  // "All" stays "All" and the range bar says so
  await expect(
    ranges(page).getByRole('button', { name: 'All' }),
  ).toHaveAttribute('aria-pressed', 'true');
  await pick(page, 'week').click();
  await expect.poll(() => bars(page)).toBe(weeks);
});

test('the weekly chart is still a handful of paths, and so is a yearly one', async ({
  page,
}) => {
  await ready(page);
  for (const key of ['week', 'year', 'quarter'] as const) {
    await pick(page, key).click();
    await expect(pick(page, key)).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-series="candles"] path')).toHaveCount(4);
  }
});

test('the interval is kept after a reload, and a stored value that is not an interval is ignored', async ({
  page,
}) => {
  await ready(page);
  await pick(page, 'quarter').click();
  await expect(pick(page, 'quarter')).toHaveAttribute('aria-pressed', 'true');
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('bach-cv-trade-chart') ?? '{}'),
  );
  expect(saved.interval).toBe('quarter');
  expect(saved.type).toBeDefined();
  await page.reload();
  await expect(chart(page)).toHaveAttribute('data-candles', /^[1-9]/);
  await expect(pick(page, 'quarter')).toHaveAttribute('aria-pressed', 'true');
  expect(await bars(page)).toBeLessThan(40);
  await page.evaluate(() =>
    localStorage.setItem(
      'bach-cv-trade-chart',
      JSON.stringify({ interval: 'decade', type: 'candles' }),
    ),
  );
  await page.reload();
  await expect(chart(page)).toHaveAttribute('data-candles', /^[1-9]/);
  // nothing valid is kept: the chart opens on months
  await expect(pick(page, 'month')).toHaveAttribute('aria-pressed', 'true');
});

test('the shortcuts Alt+1 to Alt+4 pick the interval, and the list of shortcuts says so', async ({
  page,
}) => {
  await ready(page);
  await page.keyboard.press('Alt+Digit2');
  await expect(pick(page, 'month')).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('Alt+Digit3');
  await expect(pick(page, 'quarter')).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('Alt+Digit4');
  await expect(pick(page, 'year')).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('Alt+Digit1');
  await expect(pick(page, 'week')).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('?');
  const dialog = page.getByTestId('tv-shortcuts');
  await expect(dialog).toContainText('Week, month, quarter or year candles');
  await expect(dialog).toContainText('1 – 4');
});

test('the crosshair dates a bar for its interval', async ({ page }) => {
  await ready(page);
  // a day for a week
  await expect.poll(() => dateAt(page, 0.5)).toMatch(/\d{1,2}.*\d{2}$/);
  await pick(page, 'month').click();
  await expect
    .poll(() => dateAt(page, 0.5))
    .toMatch(/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) 20\d\d/);
  await pick(page, 'quarter').click();
  await expect.poll(() => dateAt(page, 0.5)).toMatch(/^Q[1-4] 20\d\d/);
  await pick(page, 'year').click();
  await expect.poll(() => dateAt(page, 0.5)).toMatch(/^20\d\d/);
  // the last bar of the yearly chart is this year
  await expect
    .poll(() => dateAt(page, 0.97))
    .toContain(String(new Date().getFullYear()));
});

test('the time axis shows the years of a yearly chart', async ({ page }) => {
  await ready(page);
  await pick(page, 'year').click();
  await expect
    .poll(async () => {
      const texts = await chart(page)
        .locator('text')
        .evaluateAll((list) => list.map((el) => el.textContent ?? ''));
      return texts.filter((t) => /^20\d\d$/.test(t)).length;
    })
    .toBeGreaterThanOrEqual(5);
});

test('the flags stay on the chart, on the bar of the year their job started, and still open the job', async ({
  page,
}) => {
  await ready(page);
  await expect(flags(page)).toHaveCount(4);
  for (const key of ['month', 'quarter', 'year'] as const) {
    await pick(page, key).click();
    await expect(pick(page, key)).toHaveAttribute('aria-pressed', 'true');
    await expect(flags(page)).toHaveCount(4);
    for (const flag of await flags(page).all())
      await expect(flag).toBeVisible();
  }
  // two jobs on one yearly bar do not sit on top of each other: each can be clicked
  const boxes = await flags(page).evaluateAll((list) =>
    list.map((el) => {
      const r = el.getBoundingClientRect();
      return [Math.round(r.left), Math.round(r.top), Math.round(r.right)];
    }),
  );
  for (let a = 0; a < boxes.length; a++)
    for (let b = a + 1; b < boxes.length; b++) {
      const apart =
        boxes[a][2] <= boxes[b][0] ||
        boxes[b][2] <= boxes[a][0] ||
        Math.abs(boxes[a][1] - boxes[b][1]) > 18;
      expect(apart).toBe(true);
    }
  const star = page.locator('[data-marker="fpt-software"]');
  await expect(star).toContainText('★');
  await star.focus();
  await expect(star).toContainText('FPT Software');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/resume$/);
});

test('the range buttons are spans of time: on yearly candles 1Y still shows a few bars', async ({
  page,
}) => {
  await ready(page);
  await pick(page, 'month').click();
  await expect(pick(page, 'month')).toHaveAttribute('aria-pressed', 'true');
  await ranges(page).getByRole('button', { name: '1Y' }).click();
  await expect.poll(() => bars(page)).toBe(12);
  await expect(
    ranges(page).getByRole('button', { name: '1Y' }),
  ).toHaveAttribute('aria-pressed', 'true');
  await ranges(page).getByRole('button', { name: '3Y' }).click();
  await expect.poll(() => bars(page)).toBe(36);
  await pick(page, 'year').click();
  await expect(pick(page, 'year')).toHaveAttribute('aria-pressed', 'true');
  await ranges(page).getByRole('button', { name: '1Y' }).click();
  await expect.poll(() => bars(page)).toBeGreaterThanOrEqual(3);
  await expect.poll(() => bars(page)).toBeLessThanOrEqual(5);
  await expect(
    ranges(page).getByRole('button', { name: '1Y' }),
  ).toHaveAttribute('aria-pressed', 'true');
});

test('changing the interval keeps the window on the same time', async ({
  page,
}) => {
  await ready(page);
  await ranges(page).getByRole('button', { name: '3Y' }).click();
  await expect.poll(() => bars(page)).toBe(156);
  await pick(page, 'month').click();
  await expect(pick(page, 'month')).toHaveAttribute('aria-pressed', 'true');
  // three years are 36 months and the empty slots
  await expect.poll(() => bars(page)).toBeGreaterThanOrEqual(34);
  await expect.poll(() => bars(page)).toBeLessThanOrEqual(38);
  await pick(page, 'week').click();
  await expect.poll(() => bars(page)).toBeGreaterThan(140);
  await expect.poll(() => bars(page)).toBeLessThan(170);
});

test('Go to date jumps to the bar that holds the date', async ({ page }) => {
  await ready(page, '/about');
  await pick(page, 'quarter').click();
  await expect(pick(page, 'quarter')).toHaveAttribute('aria-pressed', 'true');
  await ranges(page).getByRole('button', { name: '1Y' }).click();
  await page.getByRole('button', { name: 'Go to date' }).click();
  await page.getByRole('combobox', { name: 'Year' }).selectOption('2021');
  await page.getByRole('combobox', { name: 'Month' }).selectOption('5');
  await page.getByRole('button', { name: 'Go', exact: true }).click();
  await expect
    .poll(async () => {
      const box = (await chart(page).boundingBox())!;
      await page.mouse.move(box.x + box.width * 0.45, box.y + box.height * 0.3);
      return legendDate(page).locator('span').first().innerText();
    })
    .toMatch(/^Q[12] 2021/);
});

test('drawings keep their date when the interval changes', async ({ page }) => {
  await ready(page, '/about');
  await page.keyboard.press('Alt+KeyV');
  const box = (await chart(page).boundingBox())!;
  await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.3);
  const line = page.locator('[data-drawing="vline"] line').first();
  await expect(line).toBeAttached();
  // "Wed 16 Jun 21": the month and the year of the week the line was put on
  const [, month, year] =
    (await dateAt(page, 0.5)).match(/\d{1,2} ([A-Z][a-z]{2}) (\d{2})$/) ?? [];
  expect(year).toBeDefined();
  const under = async () => {
    const x = Number(await line.getAttribute('x1'));
    const b = (await chart(page).boundingBox())!;
    await page.mouse.move(b.x + x, b.y + b.height * 0.3);
    return legendDate(page).locator('span').first().innerText();
  };
  const quarter =
    Math.floor(
      [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ].indexOf(month) / 3,
    ) + 1;
  for (const [key, text] of [
    ['month', `${month} 20${year}`],
    ['quarter', `Q${quarter} 20${year}`],
    ['year', `20${year}`],
  ] as const) {
    await pick(page, key).click();
    await expect(pick(page, key)).toHaveAttribute('aria-pressed', 'true');
    await expect.poll(under).toBe(text);
  }
  await pick(page, 'week').click();
  await expect.poll(under).toMatch(new RegExp(` ${year}$`));
  await expect(page.locator('[data-drawing="vline"]')).toHaveCount(1);
});

test('the measure tool counts real weeks and years whatever the interval', async ({
  page,
}) => {
  await ready(page, '/about');
  const measureOn = async () => {
    await page.getByRole('button', { name: 'Measure' }).click();
    const box = (await chart(page).boundingBox())!;
    await page.mouse.click(box.x + box.width * 0.3, box.y + box.height * 0.3);
    await page.mouse.click(box.x + box.width * 0.7, box.y + box.height * 0.4);
    const label = page.getByTestId('tv-measure');
    await expect(label).toContainText(/weeks/);
    return (await label.innerText()).match(/(\d+) weeks/)![1];
  };
  const weeks = Number(await measureOn());
  expect(weeks).toBeGreaterThan(100);
  await pick(page, 'year').click();
  await expect(pick(page, 'year')).toHaveAttribute('aria-pressed', 'true');
  // a bar of a year is 52 weeks wide: the same two clicks are far apart in time, a whole number of weeks
  expect(Number(await measureOn())).toBeGreaterThan(52);
});

test('replay works on monthly bars: it plays bars of months and reveals the jobs as before', async ({
  page,
}) => {
  await ready(page);
  await pick(page, 'month').click();
  await expect(pick(page, 'month')).toHaveAttribute('aria-pressed', 'true');
  const all = await bars(page);
  await page.getByRole('button', { name: 'Bar replay' }).first().click();
  const box = (await chart(page).boundingBox())!;
  await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.2);
  await expect(page.locator('[data-playhead="ready"]')).toBeAttached();
  const played = await bars(page);
  expect(played).toBeGreaterThan(all * 0.3);
  expect(played).toBeLessThan(all * 0.7);
  expect(await flags(page).count()).toBeLessThan(4);
  const step = page.getByRole('button', { name: 'Step forward one bar' });
  await step.click();
  await expect.poll(() => bars(page)).toBe(played + 1);
  // the interval can change in the middle of a replay and the playhead stays on the same date
  await pick(page, 'quarter').click();
  await expect(pick(page, 'quarter')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-playhead="ready"]')).toBeAttached();
  await expect.poll(() => bars(page)).toBeLessThan(played);
  await page.getByRole('button', { name: 'Jump to real time' }).click();
  await expect(flags(page)).toHaveCount(4);
});

test('the indicators that need more bars than there are are not drawn, and nothing breaks', async ({
  page,
}) => {
  await ready(page);
  await page.getByRole('button', { name: 'Indicators' }).first().click();
  await page.getByRole('switch', { name: /RSI/ }).click();
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-legend-row="rsi"]')).toBeVisible();
  await pick(page, 'year').click();
  await expect(pick(page, 'year')).toHaveAttribute('aria-pressed', 'true');
  // 20 bars of a yearly chart are 20 years: there is no average to draw, and no row for it
  await expect(page.locator('[data-legend-row="ma20"]')).toHaveCount(0);
  await expect(page.locator('[data-legend-row="rsi"]')).toHaveCount(0);
  await expect(page.locator('[data-legend-row="volume"]')).toBeVisible();
  await pick(page, 'quarter').click();
  await expect(page.locator('[data-legend-row="ma20"]')).toBeVisible();
  await expect(page.locator('[data-legend-row="rsi"]')).toBeVisible();
});

test('every chart type draws on yearly bars', async ({ page }) => {
  await ready(page);
  await pick(page, 'year').click();
  await expect(pick(page, 'year')).toHaveAttribute('aria-pressed', 'true');
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
    await page.getByRole('menuitemradio', { name: type, exact: true }).click();
    await expect(page.locator('[data-series] path').first()).toBeAttached();
    await expect(chart(page)).toHaveAttribute('data-candles', /^[1-9]/);
  }
});

test.describe('the interval in Vietnamese', () => {
  test('names the intervals and dates the bars in Vietnamese', async ({
    page,
  }) => {
    await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
    await ready(page);
    const vi = group(page, 'Khung thời gian');
    await expect(vi).toBeVisible();
    await expect(vi.getByRole('button', { name: 'Quý (3M)' })).toHaveText('3M');
    await expect(legend(page)).toContainText('1W');
    await vi.getByRole('button', { name: 'Quý (3M)' }).click();
    await expect(chart(page)).toHaveAttribute('aria-label', /mỗi quý một nến/);
    await expect.poll(() => dateAt(page, 0.5)).toMatch(/^Quý [1-4] 20\d\d/);
    await vi.getByRole('button', { name: 'Năm (1Y)' }).click();
    await expect.poll(() => dateAt(page, 0.5)).toMatch(/^20\d\d/);
  });
});

test.describe('without motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('switches at once, without a fade', async ({ page }) => {
    await ready(page);
    await pick(page, 'month').click();
    await expect(pick(page, 'month')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.tv-chart-fade-out')).toHaveCount(0);
    const animated = await chart(page).evaluate((el) =>
      el
        .getAnimations({ subtree: true })
        .filter((a) => (a as CSSAnimation).animationName?.includes('fade'))
        .map((a) => (a as CSSAnimation).animationName),
    );
    expect(animated).toEqual([]);
    await expect.poll(() => bars(page)).toBeLessThan(100);
  });
});

test.describe('with motion', () => {
  test('the old candles fade out while the new ones fade in', async ({
    page,
  }) => {
    await ready(page);
    await page.waitForTimeout(1500);
    await pick(page, 'year').click();
    await expect(page.locator('.tv-chart-fade-out')).toHaveCount(1);
    await expect(page.locator('.tv-chart-fade-in').first()).toBeAttached();
    await expect(page.locator('.tv-chart-fade-out')).toHaveCount(0);
  });
});

test.describe('on a phone', () => {
  test.use({ viewport: { width: 390, height: 800 }, hasTouch: true });

  test('the selector fits at 390px with touch targets of 44px and no sideways scroll', async ({
    page,
  }) => {
    await ready(page);
    for (const key of ['week', 'month', 'quarter', 'year'] as const) {
      const button = pick(page, key);
      await button.scrollIntoViewIfNeeded();
      await expect(button).toBeVisible();
      const box = (await button.boundingBox())!;
      expect(box.width).toBeGreaterThanOrEqual(43.5);
      expect(box.height).toBeGreaterThanOrEqual(43.5);
    }
    await pick(page, 'year').tap();
    await expect(pick(page, 'year')).toHaveAttribute('aria-pressed', 'true');
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      ),
    ).toBe(true);
  });
});
