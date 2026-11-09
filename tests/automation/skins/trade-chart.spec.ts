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
const legend = (page: Page) => page.getByTestId('tv-legend-date');
const ranges = (page: Page) => page.getByRole('group', { name: 'Time range' });

/** The chart is drawn when its box has a size and the jobs have arrived. */
const ready = async (page: Page, path = '/') => {
  await gotoSkin(page, path);
  await expect(chart(page)).toBeAttached();
  await expect(chart(page)).toHaveAttribute('data-candles', /^[1-9]/);
};

const middle = async (page: Page) => {
  const box = (await chart(page).boundingBox())!;
  // high in the chart, where no flag (and no hit area of one) is
  return { box, x: box.x + box.width * 0.5, y: box.y + box.height * 0.06 };
};

test('draws one weekly candle for every week of the career, and says it is an illustration', async ({
  page,
}) => {
  await ready(page);
  // from March 2020 (the first job) to now
  expect(await bars(page)).toBeGreaterThan(300);
  const name = await chart(page).getAttribute('aria-label');
  expect(name).toContain('one candle for each week');
  expect(name).toContain('derived from my real jobs');
  expect(name).toContain('not financial data');
  expect(name).not.toMatch(/\$|€|buy|sell|%/i);
  // it takes the focus and the arrow keys, so it is an application (an image is not interactive), with a role description
  await expect(chart(page)).toHaveAttribute('role', 'application');
  await expect(chart(page)).toHaveAttribute(
    'aria-roledescription',
    'Interactive chart',
  );
  // all the candles are a handful of paths, not a node each
  const paths = await page.locator('[data-series="candles"] path').count();
  expect(paths).toBe(4);
  expect(await page.locator('[data-testid="tv-chart"] *').count()).toBeLessThan(
    150,
  );
});

test('the legend says "index", never a price', async ({ page }) => {
  await ready(page, '/about');
  const text = await page.getByTestId('tv-legend').innerText();
  expect(text).toContain('Career index');
  expect(text).not.toMatch(/\$|€|price|buy|sell|%/i);
});

test('the range buttons slide the window and the pressed one follows it', async ({
  page,
}) => {
  await ready(page);
  const counts: number[] = [];
  for (const [name, weeks] of [
    ['3M', 13],
    ['6M', 26],
    ['1Y', 52],
    ['3Y', 156],
  ] as const) {
    await ranges(page).getByRole('button', { name }).click();
    await expect(ranges(page).getByRole('button', { name })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect.poll(() => bars(page)).toBe(weeks);
    counts.push(weeks);
  }
  await ranges(page).getByRole('button', { name: 'All' }).click();
  await expect.poll(() => bars(page)).toBeGreaterThan(counts[3]);
});

test('the wheel zooms, a drag pans and a double click resets', async ({
  page,
}) => {
  await ready(page, '/about');
  const all = await bars(page);
  const { x, y, box } = await middle(page);
  await page.mouse.move(x, y);
  // a notch is a gentle zoom that glides: ten of them, and the window settles on the way in
  for (let i = 0; i < 10; i++) await page.mouse.wheel(0, -100);
  await expect.poll(() => bars(page)).toBeLessThan(all * 0.6);
  // after a zoom no range button is the current one
  await expect(ranges(page).locator('[aria-pressed="true"]')).toHaveCount(0);
  const zoomed = await bars(page);
  const before = await legend(page).innerText();
  await page.mouse.down();
  await page.mouse.move(x - box.width * 0.3, y, { steps: 6 });
  await page.mouse.up();
  await page.mouse.move(box.x + box.width * 0.5, y);
  await expect.poll(() => legend(page).innerText()).not.toBe(before);
  expect(Math.abs((await bars(page)) - zoomed)).toBeLessThan(zoomed * 0.4);
  await page.mouse.dblclick(x, y);
  await expect.poll(() => bars(page)).toBe(all);
  await expect(
    ranges(page).getByRole('button', { name: 'All' }),
  ).toHaveAttribute('aria-pressed', 'true');
});

test('Go to date centres the chart on a month of the career', async ({
  page,
}) => {
  await ready(page, '/about');
  await ranges(page).getByRole('button', { name: '3M' }).click();
  await expect.poll(() => bars(page)).toBe(13);
  await page.getByRole('button', { name: 'Go to date' }).click();
  await page.getByRole('combobox', { name: 'Year' }).selectOption('2021');
  await page.getByRole('combobox', { name: 'Month' }).selectOption('5');
  await page.getByRole('button', { name: 'Go', exact: true }).click();
  const { box } = await middle(page);
  // the week in the middle of the plot is June 2021 (the window slides there, so look again until it has)
  await expect
    .poll(async () => {
      await page.mouse.move(
        box.x + (box.width - 64) / 2,
        box.y + box.height * 0.2,
      );
      return legend(page).innerText();
    })
    .toMatch(/Jun .*21|May .*21|Jul .*21/);
});

test('the log and auto switches of the price scale and the reset button work', async ({
  page,
}) => {
  await ready(page, '/about');
  const log = page.getByRole('button', { name: 'Log scale' });
  const d = () =>
    page.locator('[data-series="candles"] path').first().getAttribute('d');
  const linear = await d();
  await log.click();
  await expect(log).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(d).not.toBe(linear);
  await log.click();
  await expect.poll(d).toBe(linear);
  // dragging the price scale takes "auto" off, the button gives it back
  const { box } = await middle(page);
  const auto = page.getByRole('button', { name: 'Auto fit the price scale' });
  await expect(auto).toHaveAttribute('aria-pressed', 'true');
  await page.mouse.move(box.x + box.width - 20, box.y + 90);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width - 20, box.y + 150, { steps: 5 });
  await page.mouse.up();
  await expect(auto).toHaveAttribute('aria-pressed', 'false');
  await auto.click();
  await expect(auto).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(d).toBe(linear);
});

test('the crosshair legend follows the pointer', async ({ page }) => {
  await ready(page, '/about');
  const { box } = await middle(page);
  const before = await legend(page).innerText();
  await page.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.2);
  await expect.poll(() => legend(page).innerText()).not.toBe(before);
  const first = await legend(page).innerText();
  await page.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.25);
  await expect.poll(() => legend(page).innerText()).not.toBe(first);
  await expect(page.locator('[data-crosshair]').first()).toBeAttached();
  await expect(legend(page)).toContainText(/ · /);
  await page.mouse.move(box.x + 5, box.y + 5);
  await page.mouse.move(box.x + box.width + 40, box.y + box.height / 2);
  await expect(legend(page)).toContainText('FPT Software');
  await expect(page.locator('[data-crosshair]')).toHaveCount(0);
});

test('the arrow keys move the crosshair when the chart has the focus', async ({
  page,
}) => {
  await ready(page, '/about');
  await chart(page).focus();
  const start = await legend(page).innerText();
  await page.keyboard.press('ArrowLeft');
  await expect.poll(() => legend(page).innerText()).not.toBe(start);
  const one = await legend(page).innerText();
  await page.keyboard.press('ArrowLeft');
  await expect.poll(() => legend(page).innerText()).not.toBe(one);
  await page.keyboard.press('Home');
  await expect(legend(page)).toContainText('Mar');
  await expect(
    page.getByRole('status').filter({ hasText: /Mar/ }),
  ).toContainText('Devblock Vietnam');
  await page.keyboard.press('Escape');
  await expect(legend(page)).toContainText('Team Lead');
});

test('plus and minus zoom when the chart has the focus', async ({ page }) => {
  await ready(page, '/about');
  await chart(page).focus();
  const all = await bars(page);
  await page.keyboard.press('Equal');
  await page.keyboard.press('Equal');
  await expect.poll(() => bars(page)).toBeLessThan(all * 0.8);
  const zoomed = await bars(page);
  await page.keyboard.press('Minus');
  await page.keyboard.press('Minus');
  await expect.poll(() => bars(page)).toBeGreaterThan(zoomed);
});

test('a flag is a real job, shows a tip and opens it on the Resume page', async ({
  page,
}) => {
  await ready(page);
  const flag = page.getByRole('button', {
    name: 'Senior Mobile App Developer at MoMo (M_Service). Show it on the Resume page.',
  });
  await expect(page.locator('[data-marker]')).toHaveCount(4);
  await flag.hover();
  await expect(flag).toContainText('MoMo (M_Service)');
  await expect(flag).toContainText(/20\d\d/);
  await flag.click();
  await expect(page).toHaveURL(/\/resume$/);
  const row = page.locator('[data-job="momo"]');
  await expect(row).toHaveAttribute('data-active', 'true');
  await expect(
    row.getByRole('button', { name: 'Hide responsibilities' }),
  ).toBeVisible();
  await expect(row).toBeInViewport();
});

test('the current job has a star and the flags can be reached with the keyboard', async ({
  page,
}) => {
  await ready(page);
  const star = page.locator('[data-marker="fpt-software"]');
  await expect(star).toContainText('★');
  await star.focus();
  await expect(star).toContainText('FPT Software');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/resume$/);
});

test('flags follow zoom and pan, and one outside the window is hidden', async ({
  page,
}) => {
  await ready(page);
  const fpt = page.locator('[data-marker="fpt-software"]');
  const devblock = page.locator('[data-marker="devblock-vietnam"]');
  await expect(devblock).toBeVisible();
  await ranges(page).getByRole('button', { name: '3M' }).click();
  await expect(devblock).toBeHidden();
  await expect(fpt).toBeHidden();
  await ranges(page).getByRole('button', { name: 'All' }).click();
  await expect(devblock).toBeVisible();
});

test('the last candle ticks, and stops while the pointer is on the chart', async ({
  page,
}) => {
  await ready(page, '/about');
  const read = () =>
    page.locator('[data-series="candles"]').first().innerHTML();
  const first = await read();
  await expect.poll(read, { timeout: 15_000 }).not.toBe(first);
  const { x, y } = await middle(page);
  await page.mouse.move(x, y);
  const held = await read();
  await page.waitForTimeout(4500);
  expect(await read()).toBe(held);
});

test.describe('with reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('the last candle stands still and nothing animates', async ({
    page,
  }) => {
    await ready(page);
    const read = () =>
      page.locator('[data-series="candles"]').first().innerHTML();
    const first = await read();
    await page.waitForTimeout(5000);
    expect(await read()).toBe(first);
    const animated = await page.evaluate(
      () =>
        document
          .querySelector('.tv-root')!
          .getAnimations({ subtree: true })
          .filter((a) => a.playState === 'running').length,
    );
    expect(animated).toBe(0);
  });

  test('a range button jumps instead of sliding', async ({ page }) => {
    await ready(page);
    await ranges(page).getByRole('button', { name: '3M' }).click();
    await expect.poll(() => bars(page)).toBe(13);
  });
});

test('the chart draws in once, with its indicator lines and flags animated', async ({
  page,
}) => {
  await gotoSkin(page, '/');
  await expect(chart(page)).toBeAttached();
  const names = await page.evaluate(() =>
    document
      .querySelector('.tv-root')!
      .getAnimations({ subtree: true })
      .map((a) => (a as CSSAnimation).animationName),
  );
  expect(names).toEqual(
    expect.arrayContaining(['tv-chart-reveal', 'tv-chart-pulse']),
  );
  // the indicator lines draw themselves (they are done after a second, which a slow machine can reach before it looks)
  expect(
    await page
      .locator('[data-indicator="ma20"] path')
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe('tv-chart-draw');
  await expect
    .poll(() =>
      page.evaluate(() =>
        document
          .querySelector('.tv-root')!
          .getAnimations({ subtree: true })
          .some((a) => (a as CSSAnimation).animationName === 'tv-chart-drop'),
      ),
    )
    .toBe(true);
});

test('the chart is drawn again when the size or the theme changes', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await ready(page);
  const width = async () =>
    Number((await chart(page).getAttribute('viewBox'))!.split(' ')[2]);
  const wide = await width();
  await page.setViewportSize({ width: 1200, height: 800 });
  await expect.poll(width).toBeLessThan(wide);
  const color = () =>
    page
      .locator('[data-series="candles"] path')
      .first()
      .evaluate((el) => getComputedStyle(el).stroke);
  const dark = await color();
  await page.getByRole('button', { name: 'Theme' }).click();
  await page.getByRole('menuitemradio', { name: 'Dark' }).click();
  await expect.poll(color).not.toBe(dark);
});

test('with no job the chart says so in words, not a blank cell', async ({
  page,
}) => {
  await mockFirestore(page, {}, (collection, _id, doc) =>
    collection === 'experience' ? { ...doc, visible: false } : doc,
  );
  await gotoSkin(page, '/');
  await expect(
    page
      .getByRole('status')
      .filter({ hasText: 'No experience to show yet' })
      .first(),
  ).toBeVisible();
  await expect(chart(page)).toHaveCount(0);
  await expect(page.locator('[data-marker]')).toHaveCount(0);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test.describe('in Vietnamese', () => {
  test('the chart, its tools and its range buttons speak Vietnamese', async ({
    page,
  }) => {
    await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
    await ready(page);
    expect(await chart(page).getAttribute('aria-label')).toContain(
      'không phải dữ liệu tài chính',
    );
    await expect(
      page.getByRole('group', { name: 'Khoảng thời gian' }),
    ).toBeVisible();
    await expect(
      page.getByRole('toolbar', { name: 'Công cụ vẽ' }),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Chỉ báo' })).toBeVisible();
  });
});

test.describe('on a phone', () => {
  test.use({ viewport: { width: 390, height: 800 }, hasTouch: true });

  test('the chart fits, the tools are a strip above it and a touch moves the crosshair', async ({
    page,
  }) => {
    await ready(page);
    const box = (await chart(page).boundingBox())!;
    expect(box.width).toBeLessThanOrEqual(390);
    const tools = page.getByRole('toolbar', { name: 'Drawing tools' });
    const strip = (await tools.boundingBox())!;
    expect(strip.y + strip.height).toBeLessThanOrEqual(box.y + 1);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.mouse.move(box.x + 100, box.y + 120);
    await expect(legend(page)).not.toHaveText('');
    const flag = (await page.locator('[data-marker]').first().boundingBox())!;
    expect(flag.height).toBeGreaterThanOrEqual(16);
    for (const name of ['Cross', 'Trend line', 'Measure']) {
      const b = (await tools
        .getByRole('button', { name, exact: true })
        .boundingBox())!;
      expect(b.height).toBeGreaterThanOrEqual(43);
    }
  });

  test('pinching zooms the chart', async ({ page, context }) => {
    await ready(page);
    const all = await bars(page);
    const box = (await chart(page).boundingBox())!;
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;
    const session = await context.newCDPSession(page);
    await session.send('Input.synthesizePinchGesture', {
      x: cx,
      y: cy,
      scaleFactor: 2.5,
      relativeSpeed: 400,
      gestureSourceType: 'touch',
    });
    await expect.poll(() => bars(page)).toBeLessThan(all);
  });
});
