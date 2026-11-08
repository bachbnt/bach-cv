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
const drawing = (page: Page, kind: string) =>
  page.locator(`[data-drawing="${kind}"]`);
const rail = (page: Page) =>
  page.getByRole('toolbar', { name: 'Drawing tools' });
const tool = (page: Page, name: string) =>
  rail(page).getByRole('button', { name, exact: true });
/** The button of a group of tools (it shows the tool of the group used last). */
const group = (page: Page, id: string) =>
  rail(page).locator(`[data-group="${id}"]`);
const row = (page: Page, id: string) =>
  page.locator(`[data-legend-row="${id}"]`);

const ready = async (page: Page, path = '/') => {
  await gotoSkin(page, path);
  await expect(chart(page)).toHaveAttribute('data-candles', /^[1-9]/);
};

/** A place on the chart as a share of its width and height, high enough to be clear of the flags. */
const at = async (page: Page, fx: number, fy: number) => {
  const box = (await chart(page).boundingBox())!;
  return { x: box.x + box.width * fx, y: box.y + box.height * fy };
};
const click = async (page: Page, fx: number, fy: number) => {
  const p = await at(page, fx, fy);
  await page.mouse.click(p.x, p.y);
};
/** Two clicks make a line, a box, a Fibonacci or a measure. */
const clickTwice = async (
  page: Page,
  from: [number, number],
  to: [number, number],
) => {
  await click(page, ...from);
  const p = await at(page, ...to);
  await page.mouse.move(p.x, p.y);
  await page.mouse.click(p.x, p.y);
};
const drag = async (
  page: Page,
  from: [number, number],
  to: [number, number],
) => {
  const a = await at(page, ...from);
  const b = await at(page, ...to);
  await page.mouse.move(a.x, a.y);
  await page.mouse.down();
  await page.mouse.move(b.x, b.y, { steps: 6 });
  await page.mouse.up();
};
const ends = (page: Page, kind: string) =>
  drawing(page, kind)
    .locator('line')
    .first()
    .evaluate((el) =>
      ['x1', 'y1', 'x2', 'y2'].map((k) => Number(el.getAttribute(k))),
    );

test.describe('chart types', () => {
  const types = [
    ['Candles', 'candles'],
    ['Hollow candles', 'hollow'],
    ['Bars', 'bars'],
    ['Heikin Ashi', 'heikin'],
    ['Line', 'line'],
    ['Area', 'area'],
    ['Baseline', 'baseline'],
  ] as const;

  test('the menu has all seven, and each one draws its own picture', async ({
    page,
  }) => {
    await ready(page);
    for (const [name, id] of types) {
      await page.getByTestId('tv-type-menu').click();
      await page.getByRole('menuitemradio', { name, exact: true }).click();
      await expect(chart(page)).toHaveAttribute('data-type', id);
      await expect(
        page.locator(
          `[data-series="${id === 'hollow' || id === 'heikin' ? id : id}"]`,
        ),
      ).toBeAttached();
      await expect(page.getByTestId('tv-type-menu')).toHaveAttribute(
        'aria-label',
        `Chart type: ${name}`,
      );
    }
  });

  test('a change of type fades one picture into the next', async ({ page }) => {
    await ready(page);
    await page.getByTestId('tv-type-menu').click();
    await page.getByRole('menuitemradio', { name: 'Area' }).click();
    const fading = await page.evaluate(() =>
      // the pictures only: a legend row that has just appeared fades in with the same keyframes
      document
        .querySelector('[data-testid="tv-chart"]')!
        .getAnimations({ subtree: true })
        .map((a) => (a as CSSAnimation).animationName)
        .filter((n) => n === 'tv-chart-fade'),
    );
    expect(fading.length).toBe(2);
  });

  test('stay as the visitor left them: the type, the indicators and the magnet, and nothing else', async ({
    page,
  }) => {
    await ready(page);
    await page.getByTestId('tv-type-menu').click();
    await page.getByRole('menuitemradio', { name: 'Heikin Ashi' }).click();
    await page.getByRole('button', { name: 'Indicators' }).click();
    await page.getByRole('switch', { name: /Relative Strength/ }).click();
    await page.keyboard.press('Escape');
    await tool(page, 'Magnet to candles').click();
    await page.keyboard.press('Alt+KeyH');
    await click(page, 0.5, 0.3);
    await expect(drawing(page, 'hline')).toHaveCount(1);
    const stored = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('bach-cv-trade-chart') ?? 'null'),
    );
    expect(Object.keys(stored).sort()).toEqual([
      'indicators',
      'interval',
      'magnet',
      'type',
    ]);
    await page.reload();
    await ready(page);
    await expect(chart(page)).toHaveAttribute('data-type', 'heikin');
    await expect(page.locator('[data-indicator="rsi"]')).toBeAttached();
    await expect(tool(page, 'Magnet to candles')).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    // the drawings were in memory only
    await expect(drawing(page, 'hline')).toHaveCount(0);
  });

  test('a broken stored preference falls back to the defaults', async ({
    page,
  }) => {
    await page.addInitScript(() =>
      localStorage.setItem(
        'bach-cv-trade-chart',
        '{"type":"pie","indicators":7}',
      ),
    );
    await ready(page);
    await expect(chart(page)).toHaveAttribute('data-type', 'candles');
    await expect(row(page, 'ma20')).toBeAttached();
  });
});

test.describe('indicators', () => {
  test('the Indicators window switches each of the twelve on and off', async ({
    page,
  }) => {
    await ready(page);
    await page.getByRole('button', { name: 'Indicators' }).click();
    const dialog = page.getByTestId('tv-indicators');
    await expect(dialog.getByRole('switch')).toHaveCount(12);
    const names = [
      ['Volume', 'volume'],
      ['Moving average, 20 bars', 'ma20'],
      ['Moving average, 50 bars', 'ma50'],
      ['Moving average, 100 bars', 'ma100'],
      ['Moving average, 200 bars', 'ma200'],
      ['Exponential moving average, 20 bars', 'ema20'],
      ['Exponential moving average, 50 bars', 'ema50'],
      ['Exponential moving average, 100 bars', 'ema100'],
      ['Exponential moving average, 200 bars', 'ema200'],
      ['Bollinger Bands, 20 bars, 2 deviations', 'bollinger'],
      ['Relative Strength Index, 14 bars', 'rsi'],
      ['MACD, 12, 26 and 9 bars', 'macd'],
    ] as const;
    // the chart starts with the volume, the average of 20 bars and the exponential average of 50
    await expect(
      dialog.getByRole('switch', { name: /^Volume/ }),
    ).toHaveAttribute('aria-checked', 'true');
    for (const [name, id] of names) {
      const toggle = dialog.getByRole('switch', {
        name: new RegExp(`^${name}`),
      });
      const on = (await toggle.getAttribute('aria-checked')) === 'true';
      await toggle.click();
      if (on)
        await expect(page.locator(`[data-indicator="${id}"]`)).toHaveCount(0);
      else
        await expect(page.locator(`[data-indicator="${id}"]`)).toBeAttached();
    }
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });

  test('RSI and MACD get a pane each, under the candles, and the legend shows their value under the crosshair', async ({
    page,
  }) => {
    await ready(page);
    await page.getByRole('button', { name: 'Indicators' }).click();
    await page.getByRole('switch', { name: /Relative Strength/ }).click();
    await page.getByRole('switch', { name: /MACD/ }).click();
    await page.keyboard.press('Escape');
    const rsi = page.locator('[data-indicator="rsi"]');
    const macd = page.locator('[data-indicator="macd"]');
    await expect(rsi).toBeAttached();
    const r = (await rsi.boundingBox())!;
    const m = (await macd.boundingBox())!;
    const c = (await page.locator('[data-series]').first().boundingBox())!;
    expect(r.y).toBeGreaterThanOrEqual(c.y + c.height - 2);
    expect(m.y).toBeGreaterThanOrEqual(r.y + r.height - 2);
    const before = await row(page, 'rsi').innerText();
    expect(before).toMatch(/RSI 14\s+\d+\.\d\d/);
    expect(await row(page, 'macd').innerText()).toMatch(/MACD 12 26 9/);
    await chart(page).focus();
    await page.keyboard.press('Home');
    await page.keyboard.press('ArrowRight');
    // at the first bars the RSI has no value yet
    await expect.poll(() => row(page, 'rsi').innerText()).toContain('—');
    await page.keyboard.press('End');
    await expect.poll(() => row(page, 'rsi').innerText()).toBe(before);
  });

  test('a legend row hides an indicator, shows it again and removes it', async ({
    page,
  }) => {
    await ready(page);
    const ma = page.locator('[data-indicator="ma20"]');
    await expect(ma).toBeAttached();
    await page.getByRole('button', { name: 'Hide MA 20' }).click();
    await expect(ma).toHaveCount(0);
    await expect(row(page, 'ma20')).toHaveAttribute('data-mode', 'hidden');
    await page.getByRole('button', { name: 'Show MA 20' }).click();
    await expect(ma).toBeAttached();
    await page.getByRole('button', { name: 'Remove MA 20' }).click();
    await expect(row(page, 'ma20')).toHaveCount(0);
    await expect(ma).toHaveCount(0);
    // the legend can be folded away
    await page.getByRole('button', { name: 'Hide the legend' }).click();
    await expect(row(page, 'volume')).toHaveCount(0);
    await page.getByRole('button', { name: 'Show the legend' }).click();
    await expect(row(page, 'volume')).toBeAttached();
  });

  test('the indicator lines draw themselves when they appear', async ({
    page,
  }) => {
    await ready(page);
    await page.waitForTimeout(2600);
    await page.getByRole('button', { name: 'Indicators' }).click();
    await page.getByRole('switch', { name: /Bollinger/ }).click();
    await page.keyboard.press('Escape');
    await expect
      .poll(() =>
        page.evaluate(() =>
          document
            .querySelector('[data-indicator="bollinger"]')!
            .getAnimations({ subtree: true })
            .some((a) => (a as CSSAnimation).animationName === 'tv-chart-draw'),
        ),
      )
      .toBe(true);
  });
});

test.describe('drawing tools', () => {
  test('each tool draws what its name says, with the keyboard shortcut or the rail', async ({
    page,
  }) => {
    await ready(page);
    await page.keyboard.press('Alt+KeyT');
    await expect(tool(page, 'Trend line')).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await clickTwice(page, [0.4, 0.4], [0.7, 0.2]);
    await expect(drawing(page, 'trend')).toHaveCount(1);
    // a tool lets go of the pointer after one drawing
    await expect(chart(page)).toHaveAttribute('data-tool', 'cursor');

    await page.keyboard.press('Alt+KeyH');
    await click(page, 0.5, 0.35);
    await expect(drawing(page, 'hline')).toHaveCount(1);
    await expect(drawing(page, 'hline')).toContainText(/\d+\.\d\d/);

    await page.keyboard.press('Alt+KeyV');
    await click(page, 0.6, 0.3);
    await expect(drawing(page, 'vline')).toHaveCount(1);

    await page.keyboard.press('Alt+KeyR');
    await drag(page, [0.75, 0.15], [0.85, 0.4]);
    await expect(drawing(page, 'rect')).toHaveCount(1);

    await page.keyboard.press('Alt+KeyF');
    await clickTwice(page, [0.45, 0.45], [0.6, 0.15]);
    await expect(drawing(page, 'fib')).toHaveCount(1);
    await expect(drawing(page, 'fib')).toContainText('0.618');

    await group(page, 'lines').click({ button: 'right' });
    await page.getByRole('menuitem', { name: 'Ray' }).click();
    await clickTwice(page, [0.8, 0.45], [0.9, 0.4]);
    await expect(drawing(page, 'ray')).toHaveCount(1);
  });

  test('a text note is typed where it is placed', async ({ page }) => {
    await ready(page);
    await tool(page, 'Text note').click();
    await click(page, 0.5, 0.3);
    await page
      .getByRole('textbox', { name: 'Text of the note' })
      .fill('Joined FPT');
    await page.keyboard.press('Enter');
    await expect(drawing(page, 'text')).toContainText('Joined FPT');
    await tool(page, 'Text note').click();
    await click(page, 0.6, 0.3);
    await page.keyboard.press('Escape');
    await expect(drawing(page, 'text')).toHaveCount(1);
  });

  test('a drawing is made by clicking twice or by pressing and dragging, and Escape drops a half-made one', async ({
    page,
  }) => {
    await ready(page);
    await page.keyboard.press('Alt+KeyT');
    await expect(page.getByTestId('tv-hint')).toHaveText(
      'Click or tap the first point.',
    );
    await click(page, 0.4, 0.1);
    await expect(page.getByTestId('tv-hint')).toHaveText(
      'Click or tap the second point.',
    );
    const p = await at(page, 0.6, 0.2);
    await page.mouse.move(p.x, p.y);
    await expect(drawing(page, 'trend')).toHaveCount(1);
    await page.keyboard.press('Escape');
    await expect(drawing(page, 'trend')).toHaveCount(0);
    await expect(chart(page)).toHaveAttribute('data-tool', 'cursor');
    await page.keyboard.press('Alt+KeyT');
    await drag(page, [0.4, 0.4], [0.6, 0.2]);
    await expect(drawing(page, 'trend')).toHaveCount(1);
  });

  test('a drawing is chosen, moved by dragging, and removed with Delete', async ({
    page,
  }) => {
    await ready(page);
    await page.keyboard.press('Alt+KeyT');
    await clickTwice(page, [0.4, 0.4], [0.7, 0.2]);
    const [x1, y1, x2, y2] = await ends(page, 'trend');
    const box = (await chart(page).boundingBox())!;
    const mid = { x: box.x + (x1 + x2) / 2, y: box.y + (y1 + y2) / 2 };
    await page.mouse.click(mid.x, mid.y);
    await expect(drawing(page, 'trend').locator('circle')).toHaveCount(2);
    await page.mouse.move(mid.x, mid.y);
    await page.mouse.down();
    await page.mouse.move(mid.x - 80, mid.y + 40, { steps: 6 });
    await page.mouse.up();
    const moved = await ends(page, 'trend');
    expect(moved[0]).toBeCloseTo(x1 - 80, 0);
    expect(moved[1]).toBeCloseTo(y1 + 40, 0);
    expect(moved[2] - moved[0]).toBeCloseTo(x2 - x1, 0);
    // one of its ends can be dragged on its own
    const end = { x: box.x + moved[2], y: box.y + moved[3] };
    await page.mouse.move(end.x, end.y);
    await page.mouse.down();
    await page.mouse.move(end.x + 30, end.y, { steps: 4 });
    await page.mouse.up();
    const stretched = await ends(page, 'trend');
    expect(stretched[0]).toBeCloseTo(moved[0], 0);
    expect(stretched[2]).toBeCloseTo(moved[2] + 30, 0);
    await page.keyboard.press('Delete');
    await expect(drawing(page, 'trend')).toHaveCount(0);
    // moving and stretching were one step each: undo brings it back as it was
    await page.keyboard.press('Control+KeyZ');
    await expect(drawing(page, 'trend')).toHaveCount(1);
    expect(await ends(page, 'trend')).toEqual(stretched);
    await page.keyboard.press('Control+KeyZ');
    expect(await ends(page, 'trend')).toEqual(moved);
  });

  test('drawings follow the zoom and the pan, because they are in data units', async ({
    page,
  }) => {
    await ready(page);
    await page.keyboard.press('Alt+KeyH');
    await click(page, 0.5, 0.3);
    await page.keyboard.press('Alt+KeyV');
    await click(page, 0.6, 0.3);
    const x = () =>
      drawing(page, 'vline')
        .locator('line')
        .evaluate((el) => Number(el.getAttribute('x1')));
    const before = await x();
    const p = await at(page, 0.3, 0.2);
    await page.mouse.move(p.x, p.y);
    for (let i = 0; i < 4; i++) await page.mouse.wheel(0, -100);
    await expect.poll(x).not.toBe(before);
    await expect(drawing(page, 'hline')).toBeAttached();
  });

  test('the eraser removes the drawing it is clicked on', async ({ page }) => {
    await ready(page);
    await page.keyboard.press('Alt+KeyT');
    await clickTwice(page, [0.4, 0.4], [0.7, 0.2]);
    const [x1, y1, x2, y2] = await ends(page, 'trend');
    const box = (await chart(page).boundingBox())!;
    await group(page, 'cursors').click({ button: 'right' });
    await page.getByRole('menuitem', { name: 'Eraser' }).click();
    await page.mouse.click(box.x + (x1 + x2) / 2, box.y + (y1 + y2) / 2);
    await expect(drawing(page, 'trend')).toHaveCount(0);
  });

  test('undo, redo, hide all and remove all', async ({ page }) => {
    await ready(page);
    // undo and redo are in the top toolbar
    const undo = page.getByRole('button', { name: 'Undo', exact: true });
    const redo = page.getByRole('button', { name: 'Redo', exact: true });
    await expect(undo).toBeDisabled();
    await page.keyboard.press('Alt+KeyH');
    await click(page, 0.5, 0.3);
    await page.keyboard.press('Alt+KeyV');
    await click(page, 0.6, 0.3);
    await expect(page.locator('[data-drawing]')).toHaveCount(2);
    await undo.click();
    await expect(page.locator('[data-drawing]')).toHaveCount(1);
    await expect(redo).toBeEnabled();
    await redo.click();
    await expect(page.locator('[data-drawing]')).toHaveCount(2);
    await page.keyboard.press('Control+KeyZ');
    await expect(page.locator('[data-drawing]')).toHaveCount(1);
    await page.keyboard.press('Shift+Control+KeyZ');
    await expect(page.locator('[data-drawing]')).toHaveCount(2);

    await tool(page, 'Hide all drawings').click();
    await expect(page.locator('[data-drawing]')).toHaveCount(0);
    await tool(page, 'Show all drawings').click();
    await expect(page.locator('[data-drawing]')).toHaveCount(2);

    await tool(page, 'Remove all drawings').click();
    await expect(page.locator('[data-drawing]')).toHaveCount(0);
    await expect(tool(page, 'Remove all drawings')).toBeDisabled();
    await undo.click();
    await expect(page.locator('[data-drawing]')).toHaveCount(2);
  });

  test('a new drawing pops in, and a flag keeps its click', async ({
    page,
  }) => {
    await ready(page);
    await page.waitForTimeout(2600);
    await page.keyboard.press('Alt+KeyH');
    await click(page, 0.5, 0.3);
    const names = await page.evaluate(() =>
      document
        .querySelector('[data-drawing="hline"]')!
        .getAnimations()
        .map((a) => (a as CSSAnimation).animationName),
    );
    expect(names).toContain('tv-chart-pop');
  });

  test('the magnet snaps a point to a candle', async ({ page }) => {
    await ready(page);
    await page.getByRole('button', { name: 'Go to date' }).click();
    await page.keyboard.press('Escape');
    await page
      .getByRole('group', { name: 'Time range' })
      .getByRole('button', { name: '3M' })
      .click();
    await expect(chart(page)).toHaveAttribute('data-candles', '13');
    const slot = ((await chart(page).boundingBox())!.width - 64) / 17;
    await tool(page, 'Magnet to candles').click();
    await page.keyboard.press('Alt+KeyV');
    // a click between two candles lands on one of them: the line is at the middle of a slot
    const p = await at(page, 0.5, 0.3);
    await page.mouse.click(p.x + slot * 0.3, p.y);
    const x1 = await drawing(page, 'vline')
      .locator('line')
      .evaluate((el) => Number(el.getAttribute('x1')));
    const box = (await chart(page).boundingBox())!;
    expect(((x1 - slot / 2) / slot) % 1).toBeCloseTo(0, 1);
    expect(x1).toBeLessThan(box.width);
  });
});

test.describe('measure', () => {
  test('tells the weeks and years, the two jobs and the change in index points', async ({
    page,
  }) => {
    await ready(page);
    await page.keyboard.press('Alt+KeyM');
    await expect(page.getByTestId('tv-hint')).toContainText('two points');
    await clickTwice(page, [0.1, 0.45], [0.9, 0.2]);
    const label = page.getByTestId('tv-measure');
    await expect(label).toContainText(/\d+ weeks \(\d+(\.\d)? years\)/);
    await expect(label).toContainText(/[+-]?\d+(\.\d+)? index points/);
    await expect(label).toContainText(
      'From: Junior Mobile Developer · Devblock Vietnam',
    );
    await expect(label).toContainText('To: Team Lead · FPT Software');
    expect(await label.innerText()).not.toMatch(/\$|€|%/);
    // it goes away with the next press on the chart, and is not a drawing
    await expect(page.locator('[data-drawing]')).toHaveCount(0);
    await click(page, 0.5, 0.45);
    await expect(label).toHaveCount(0);
  });
});

test.describe('keyboard shortcuts window', () => {
  test('the question mark opens the list and Escape closes it', async ({
    page,
  }) => {
    await ready(page);
    await page.keyboard.press('Shift+Slash');
    const dialog = page.getByTestId('tv-shortcuts');
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('Trend line');
    await expect(dialog).toContainText('Bar replay');
    await expect(dialog.locator('kbd').first()).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await page.getByRole('button', { name: 'Keyboard shortcuts' }).click();
    await expect(dialog).toBeVisible();
  });

  test('a shortcut does not fire while a visitor types in a field', async ({
    page,
  }) => {
    await ready(page);
    await tool(page, 'Text note').click();
    await click(page, 0.5, 0.3);
    const input = page.getByRole('textbox', { name: 'Text of the note' });
    await input.fill('');
    await page.keyboard.press('Shift+Slash');
    await expect(page.getByTestId('tv-shortcuts')).toHaveCount(0);
    await expect(input).toHaveValue('?');
  });
});

test.describe('in Vietnamese', () => {
  test('the tools, the types and the legend have Vietnamese names', async ({
    page,
  }) => {
    await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
    await ready(page);
    const tools = page.getByRole('toolbar', { name: 'Công cụ vẽ' });
    for (const name of ['Chữ thập', 'Đường xu hướng', 'Ghi chú chữ', 'Đo'])
      await expect(
        tools.getByRole('button', { name, exact: true }),
      ).toBeVisible();
    // undo and redo are in the top toolbar
    await expect(
      page.getByRole('button', { name: 'Hoàn tác', exact: true }),
    ).toBeVisible();
    await tools.locator('[data-group="cursors"]').click({ button: 'right' });
    await expect(page.getByRole('menuitem', { name: 'Cục tẩy' })).toBeVisible();
    await page.keyboard.press('Escape');
    await page.getByTestId('tv-type-menu').click();
    await expect(
      page.getByRole('menuitemradio', { name: 'Nến rỗng' }),
    ).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(
      page.getByRole('menuitemradio', { name: 'Nến rỗng' }),
    ).toBeHidden();
    await expect(page.getByTestId('tv-legend')).toContainText(
      'Chỉ số sự nghiệp',
    );
    await page.keyboard.press('Shift+Slash');
    await expect(page.getByRole('dialog', { name: 'Phím tắt' })).toBeVisible();
    await expect(page.getByTestId('tv-shortcuts')).toContainText('Vẽ');
  });
});
