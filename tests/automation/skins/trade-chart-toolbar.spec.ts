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
const rail = (page: Page) =>
  page.getByRole('toolbar', { name: 'Drawing tools' });
const group = (page: Page, id: string) =>
  rail(page).locator(`[data-group="${id}"]`);
const header = (page: Page) => page.getByRole('banner');

const ready = async (page: Page) => {
  await gotoSkin(page, '/');
  await expect(chart(page)).toHaveAttribute('data-candles', /^[1-9]/);
};

const drawing = (page: Page, kind: string) =>
  page.locator(`[data-drawing="${kind}"]`);

/** Two clicks on the chart, high enough to be clear of the flags. */
const clickTwice = async (
  page: Page,
  a: [number, number],
  b: [number, number],
) => {
  const box = (await chart(page).boundingBox())!;
  const at = ([fx, fy]: [number, number]) => ({
    x: box.x + box.width * fx,
    y: box.y + box.height * fy,
  });
  await page.mouse.click(at(a).x, at(a).y);
  await page.mouse.move(at(b).x, at(b).y, { steps: 3 });
  await page.mouse.click(at(b).x, at(b).y);
};

test.describe('one toolbar', () => {
  test('the chart controls are in the top toolbar, in the order of a chart terminal', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await ready(page);
    const bar = header(page);
    const strip = bar.getByRole('group', { name: 'Chart controls' });
    await expect(strip.getByRole('group', { name: 'Interval' })).toBeVisible();
    for (const name of [
      /^Chart type/,
      'Indicators',
      'Bar replay',
      'Undo',
      'Redo',
    ])
      await expect(strip.getByRole('button', { name })).toBeVisible();
    // the symbol search comes before them and the menus after them
    const xs = await Promise.all(
      [
        bar.getByRole('button', { name: 'Search the site' }),
        strip.getByRole('group', { name: 'Interval' }),
        strip.getByRole('button', { name: /^Chart type/ }),
        strip.getByRole('button', { name: 'Indicators' }),
        strip.getByRole('button', { name: 'Bar replay' }),
        strip.getByRole('button', { name: 'Redo' }),
        bar.getByRole('button', { name: 'Download CV' }),
      ].map(async (l) => (await l.boundingBox())!.x),
    );
    expect([...xs].sort((a, b) => a - b)).toEqual(xs);
    // one row, 38 to 40px high, with nothing between it and the chart but the chart's own header
    const box = (await bar.boundingBox())!;
    expect(box.height).toBeGreaterThanOrEqual(38);
    expect(box.height).toBeLessThanOrEqual(41);
    const top = (await chart(page).boundingBox())!.y;
    expect(top).toBeLessThanOrEqual(box.y + box.height + 1);
    // zoom and the list of shortcuts are under the chart
    const ranges = page.getByRole('toolbar', { name: 'Time range' });
    for (const name of ['Zoom out', 'Zoom in', 'Keyboard shortcuts'])
      await expect(ranges.getByRole('button', { name })).toBeVisible();
    await expect(strip.getByRole('button', { name: 'Zoom in' })).toHaveCount(0);
    await ranges.getByRole('button', { name: 'Keyboard shortcuts' }).click();
    await expect(page.getByTestId('tv-shortcuts')).toBeVisible();
  });

  test('the menus are in the order of the other skins: Language, Skin, Theme', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await ready(page);
    const bar = header(page);
    const xs = await Promise.all(
      [/^Language/, /^Skin/, 'Theme'].map(
        async (name) =>
          (await bar.getByRole('button', { name }).boundingBox())!.x,
      ),
    );
    expect([...xs].sort((a, b) => a - b)).toEqual(xs);
    expect(new Set(xs).size).toBe(3);
  });

  test('undo and redo are in it and work', async ({ page }) => {
    await ready(page);
    const undo = header(page).getByRole('button', {
      name: 'Undo',
      exact: true,
    });
    await expect(undo).toBeDisabled();
    await page.keyboard.press('Alt+KeyH');
    const box = (await chart(page).boundingBox())!;
    await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.3);
    await expect(drawing(page, 'hline')).toHaveCount(1);
    await undo.click();
    await expect(drawing(page, 'hline')).toHaveCount(0);
  });

  test('the buttons have tips with their name and keys, and a focus ring', async ({
    page,
  }) => {
    await ready(page);
    const replay = header(page).getByRole('button', { name: 'Bar replay' });
    await replay.focus();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    await expect(page.getByText('Shift+R').first()).toBeVisible();
    // the one ring of the skin: 2px, solid, inset (see trade.css)
    const ring = await replay.evaluate((el) => {
      const s = getComputedStyle(el);
      return [s.outlineWidth, s.outlineStyle, s.outlineOffset].join(' ');
    });
    expect(ring).toBe('2px solid -2px');
  });
});

test.describe('the ticker tape', () => {
  const tape = (page: Page) =>
    page.getByRole('region', { name: /^Ticker tape/ });

  test('is a thin strip under the range bar, not above the chart', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await ready(page);
    const strip = (await tape(page).boundingBox())!;
    const ranges = (await page
      .getByRole('toolbar', { name: 'Time range' })
      .boundingBox())!;
    const plot = (await chart(page).boundingBox())!;
    expect(strip.y).toBeGreaterThanOrEqual(ranges.y + ranges.height - 1);
    expect(strip.y).toBeGreaterThan(plot.y + plot.height);
    expect(strip.height).toBeLessThanOrEqual(31);
    // it still has its pause button
    await expect(
      tape(page).getByRole('button', {
        name: 'Pause the moving list of technologies',
      }),
    ).toBeVisible();
  });

  test('can be turned off in the Layout menu, and the choice is kept', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await ready(page);
    const before = (await chart(page).boundingBox())!;
    await page
      .getByRole('button', { name: 'Choose what the terminal shows' })
      .click();
    const item = page.getByRole('menuitemcheckbox', { name: 'Ticker tape' });
    await expect(item).toHaveAttribute('aria-checked', 'true');
    await item.click();
    await expect(tape(page)).toHaveCount(0);
    const saved = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('bach-cv-trade-layout') ?? '{}'),
    );
    expect(saved.tape).toBe(false);
    await page.reload();
    await expect(chart(page)).toHaveAttribute('data-candles', /^[1-9]/);
    await expect(tape(page)).toHaveCount(0);
    // the chart did not move: it is the same size with the strip gone (the page panel takes the room)
    const after = (await chart(page).boundingBox())!;
    expect(Math.abs(after.y - before.y)).toBeLessThan(2);
  });
});

test.describe('the tool rail', () => {
  test('groups the tools: one button for each, showing the tool of its group', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await ready(page);
    for (const [id, name] of [
      ['cursors', 'Cross'],
      ['lines', 'Trend line'],
      ['fib', 'Fib retracement'],
      ['shapes', 'Rectangle'],
      ['text', 'Text note'],
      ['measure', 'Measure'],
    ] as const)
      await expect(group(page, id)).toHaveAttribute('aria-label', name);
    // the flat icons of the lines are gone: the Lines group is one button
    await expect(rail(page).locator('[data-group]')).toHaveCount(6);
    await expect(
      rail(page).getByRole('button', { name: 'Vertical line', exact: true }),
    ).toHaveCount(0);
    // the cursor is the tool in use, clearly marked
    await expect(group(page, 'cursors')).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(group(page, 'lines')).toHaveAttribute('aria-pressed', 'false');
  });

  test('a click uses the tool shown, the triangle opens a flyout of the group with names and keys', async ({
    page,
  }) => {
    await ready(page);
    await group(page, 'lines').click();
    await expect(group(page, 'lines')).toHaveAttribute('aria-pressed', 'true');
    await expect(chart(page)).toHaveAttribute('data-tool', 'trend');
    await group(page, 'lines').click();
    await expect(chart(page)).toHaveAttribute('data-tool', 'cursor');
    await rail(page)
      .getByRole('button', { name: 'Trend line: more tools' })
      .click();
    const menu = page.getByRole('menu');
    for (const [name, keys] of [
      ['Trend line', 'Alt+T'],
      ['Ray', ''],
      ['Horizontal line', 'Alt+H'],
      ['Vertical line', 'Alt+V'],
    ] as const) {
      const item = menu.getByRole('menuitem', { name: new RegExp(`^${name}`) });
      await expect(item).toBeVisible();
      if (keys) await expect(item).toContainText(keys);
    }
    await menu.getByRole('menuitem', { name: /^Horizontal line/ }).click();
    await expect(chart(page)).toHaveAttribute('data-tool', 'hline');
    // the button now shows the last used tool of its group
    await expect(group(page, 'lines')).toHaveAttribute(
      'aria-label',
      'Horizontal line',
    );
    await page.keyboard.press('Escape');
    await expect(group(page, 'lines')).toHaveAttribute(
      'aria-label',
      'Horizontal line',
    );
    await expect(chart(page)).toHaveAttribute('data-tool', 'cursor');
    await group(page, 'lines').click();
    await expect(chart(page)).toHaveAttribute('data-tool', 'hline');
  });

  test('a key picks a tool and the group shows it', async ({ page }) => {
    await ready(page);
    await page.keyboard.press('Alt+KeyV');
    await expect(group(page, 'lines')).toHaveAttribute(
      'aria-label',
      'Vertical line',
    );
    await expect(group(page, 'lines')).toHaveAttribute('aria-pressed', 'true');
  });

  test('right click opens the flyout, and the arrows, Enter and Escape drive it with the focus coming back', async ({
    page,
  }) => {
    await ready(page);
    await group(page, 'lines').click({ button: 'right' });
    await expect(page.getByRole('menu')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('menu')).toHaveCount(0);
    await group(page, 'lines').focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('menu')).toBeVisible();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(page.getByRole('menu')).toHaveCount(0);
    await expect(chart(page)).toHaveAttribute('data-tool', /ray|hline/);
    await expect(group(page, 'lines')).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('menu')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(group(page, 'lines')).toBeFocused();
  });

  test('the cursors group holds the eraser too', async ({ page }) => {
    await ready(page);
    await group(page, 'cursors').click({ button: 'right' });
    for (const name of ['Cross', 'Dot', 'Arrow', 'Eraser'])
      await expect(
        page.getByRole('menuitem', { name: new RegExp(`^${name}`) }),
      ).toBeVisible();
    await page.getByRole('menuitem', { name: /^Eraser/ }).click();
    await expect(chart(page)).toHaveAttribute('data-tool', 'eraser');
    await expect(group(page, 'cursors')).toHaveAttribute(
      'aria-label',
      'Eraser',
    );
    await group(page, 'cursors').click({ button: 'right' });
    await page.getByRole('menuitem', { name: /^Dot/ }).click();
    await expect(chart(page)).toHaveAttribute('data-tool', 'cursor');
    await expect(chart(page)).toHaveAttribute('data-cursor', 'dot');
  });

  test('the tip of a button has its name and its keys', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await ready(page);
    await group(page, 'lines').hover();
    const tip = page.getByText('Alt+T').first();
    await expect(tip).toBeVisible();
    await expect(page.getByText('Double-click to keep drawing')).toBeVisible();
  });

  test('a one line hint says what to do next while a tool is on', async ({
    page,
  }) => {
    await ready(page);
    await expect(page.getByTestId('tv-hint')).toHaveCount(0);
    await group(page, 'lines').click();
    await expect(page.getByTestId('tv-hint')).toHaveText(
      'Click or tap the first point.',
    );
    const box = (await chart(page).boundingBox())!;
    await page.mouse.click(box.x + box.width * 0.15, box.y + box.height * 0.1);
    await page.mouse.move(box.x + box.width * 0.25, box.y + box.height * 0.1);
    await expect(page.getByTestId('tv-hint')).toHaveText(
      'Click or tap the second point.',
    );
  });

  test('a tool that is double-clicked stays on after each drawing, until Escape', async ({
    page,
  }) => {
    await ready(page);
    await group(page, 'lines').dblclick();
    await expect(chart(page)).toHaveAttribute('data-tool', 'trend');
    await expect(page.getByTestId('tv-hint')).toContainText('Esc');
    await clickTwice(page, [0.3, 0.4], [0.5, 0.25]);
    await expect(drawing(page, 'trend')).toHaveCount(1);
    await expect(chart(page)).toHaveAttribute('data-tool', 'trend');
    await clickTwice(page, [0.55, 0.45], [0.75, 0.3]);
    await expect(drawing(page, 'trend')).toHaveCount(2);
    await page.keyboard.press('Escape');
    await expect(chart(page)).toHaveAttribute('data-tool', 'cursor');
    // without a double click the tool lets go after one drawing
    await group(page, 'lines').click();
    await clickTwice(page, [0.3, 0.2], [0.4, 0.15]);
    await expect(drawing(page, 'trend')).toHaveCount(3);
    await expect(chart(page)).toHaveAttribute('data-tool', 'cursor');
  });

  test('undo and redo are not in the rail any more', async ({ page }) => {
    await ready(page);
    await expect(rail(page).getByRole('button', { name: 'Undo' })).toHaveCount(
      0,
    );
    await expect(
      rail(page).getByRole('button', { name: 'Magnet to candles' }),
    ).toBeVisible();
    await expect(
      rail(page).getByRole('button', { name: 'Remove all drawings' }),
    ).toBeVisible();
  });
});

test.describe('in Vietnamese', () => {
  test('names the groups, the flyout and the tips in Vietnamese', async ({
    page,
  }) => {
    await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
    await ready(page);
    const tools = page.getByRole('toolbar', { name: 'Công cụ vẽ' });
    const lines = tools.locator('[data-group="lines"]');
    await lines.click();
    await expect(page.getByTestId('tv-hint')).toContainText('Bấm hoặc chạm');
    await page.keyboard.press('Escape');
    await tools
      .getByRole('button', { name: 'Đường xu hướng: thêm công cụ' })
      .click();
    await expect(
      page.getByRole('menuitem', { name: /^Đường ngang/ }),
    ).toBeVisible();
    await page.keyboard.press('Escape');
    await lines.dblclick();
    await expect(page.getByTestId('tv-hint')).toContainText('Esc');
  });
});

test.describe('on a phone', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  test('the controls have a row of their own that scrolls, the menus stay reachable and nothing scrolls the page', async ({
    page,
  }) => {
    await ready(page);
    const bar = header(page);
    // the Skin menu is always reachable
    const skin = bar.getByRole('button', { name: /^Skin/ });
    await expect(skin).toBeVisible();
    expect((await skin.boundingBox())!.x + 44).toBeLessThanOrEqual(391);
    const xs = await Promise.all(
      [/^Language/, /^Skin/, 'Theme'].map(
        async (name) =>
          (await bar.getByRole('button', { name }).boundingBox())!.x,
      ),
    );
    expect([...xs].sort((a, b) => a - b)).toEqual(xs);
    // the interval buttons and the chart type are in the strip, with 44px targets
    for (const name of [
      'Week (1W)',
      'Month (1M)',
      'Quarter (3M)',
      'Year (1Y)',
      'Indicators: 3 on',
      'Bar replay',
      'Undo',
    ]) {
      const b = bar.getByRole('button', { name, exact: true });
      await b.scrollIntoViewIfNeeded();
      const box = (await b.boundingBox())!;
      expect(box.height).toBeGreaterThanOrEqual(43.5);
      expect(box.x + box.width).toBeLessThanOrEqual(391);
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    // a long press opens the flyout of a group
    const lines = group(page, 'lines');
    const box = (await lines.boundingBox())!;
    const session = await page.context().newCDPSession(page);
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x: box.x + box.width / 2, y: box.y + box.height / 2 }],
    });
    await page.waitForTimeout(700);
    await expect(page.getByRole('menu')).toBeVisible();
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchEnd',
      touchPoints: [],
    });
  });
});
