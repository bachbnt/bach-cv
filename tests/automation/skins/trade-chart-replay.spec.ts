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
const replayBar = (page: Page) =>
  page.getByRole('toolbar', { name: 'Bar replay' });
const flags = (page: Page) => page.locator('[data-marker]');
const live = (page: Page) => page.getByTestId('tv-replay-live');

const ready = async (page: Page) => {
  await gotoSkin(page, '/');
  await expect(chart(page)).toHaveAttribute('data-candles', /^[1-9]/);
};

/** Starts a replay at a share of the chart's width. */
const start = async (page: Page, share: number) => {
  await page.getByRole('button', { name: 'Bar replay' }).first().click();
  const box = (await chart(page).boundingBox())!;
  await page.mouse.move(box.x + box.width * share, box.y + box.height * 0.2);
  await page.mouse.click(box.x + box.width * share, box.y + box.height * 0.2);
  await expect(page.locator('[data-playhead="ready"]')).toBeAttached();
};

test('choose a start bar: the weeks after it are hidden, and so are the jobs that come later', async ({
  page,
}) => {
  await ready(page);
  const all = await bars(page);
  await expect(flags(page)).toHaveCount(4);
  await page.getByRole('button', { name: 'Bar replay' }).first().click();
  await expect(page.getByTestId('tv-hint')).toContainText(
    'Click the chart to choose the first bar of the replay.',
  );
  await expect(replayBar(page)).toBeVisible();
  // while choosing, a dashed line follows the pointer
  const box = (await chart(page).boundingBox())!;
  await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.2);
  await expect(page.locator('[data-playhead="select"]')).toBeAttached();
  await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.2);
  await expect(page.locator('[data-playhead="ready"]')).toBeAttached();
  const played = await bars(page);
  expect(played).toBeGreaterThan(all * 0.3);
  expect(played).toBeLessThan(all * 0.7);
  expect(await flags(page).count()).toBeLessThan(4);
  await expect(page.locator('[data-marker="fpt-software"]')).toHaveCount(0);
  // the playhead glows
  const glowing = await page.evaluate(() =>
    document
      .querySelector('[data-playhead="ready"]')!
      .getAnimations({ subtree: true })
      .some((a) => (a as CSSAnimation).animationName === 'tv-chart-glow'),
  );
  expect(glowing).toBe(true);
  // the crosshair cannot go past the playhead
  await page.mouse.move(box.x + box.width * 0.9, box.y + box.height * 0.2);
  await expect(page.getByTestId('tv-legend-date')).not.toContainText(
    'Sun 1 Nov 26',
  );
});

test('step forward shows one more week', async ({ page }) => {
  await ready(page);
  await start(page, 0.3);
  const first = await bars(page);
  await replayBar(page)
    .getByRole('button', { name: 'Step forward one bar' })
    .click();
  await expect.poll(() => bars(page)).toBe(first + 1);
  await replayBar(page)
    .getByRole('button', { name: 'Step forward one bar' })
    .click();
  await expect.poll(() => bars(page)).toBe(first + 2);
});

test('play at 10x brings in each job as the playhead passes it, and says so politely', async ({
  page,
}) => {
  await ready(page);
  await start(page, 0.1);
  const before = await flags(page).count();
  await expect(live(page)).toHaveAttribute('aria-live', 'polite');
  await replayBar(page)
    .getByRole('button', { name: '10x', exact: true })
    .click();
  await expect(
    replayBar(page).getByRole('button', { name: '10x', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  const start0 = await bars(page);
  await replayBar(page)
    .getByRole('button', { name: 'Play', exact: true })
    .click();
  await expect(
    replayBar(page).getByRole('button', { name: 'Pause', exact: true }),
  ).toBeVisible();
  await expect
    .poll(() => flags(page).count(), { timeout: 30_000 })
    .toBeGreaterThan(before);
  expect(await bars(page)).toBeGreaterThan(start0);
  await expect(live(page)).toHaveText(/\S+, \S+/);
  await replayBar(page)
    .getByRole('button', { name: 'Pause', exact: true })
    .click();
  const held = await bars(page);
  await page.waitForTimeout(600);
  expect(await bars(page)).toBe(held);
});

test('play reaches the end by itself, pauses there, and the real chart is one click away', async ({
  page,
}) => {
  await ready(page);
  const all = await bars(page);
  await start(page, 0.9);
  await replayBar(page)
    .getByRole('button', { name: '10x', exact: true })
    .click();
  await replayBar(page)
    .getByRole('button', { name: 'Play', exact: true })
    .click();
  await expect.poll(() => bars(page), { timeout: 30_000 }).toBe(all);
  await expect(
    replayBar(page).getByRole('button', { name: 'Play', exact: true }),
  ).toBeVisible();
  await expect(flags(page)).toHaveCount(4);
  await replayBar(page)
    .getByRole('button', { name: 'Jump to real time' })
    .click();
  await expect(replayBar(page)).toHaveCount(0);
  await expect(page.locator('[data-playhead]')).toHaveCount(0);
  expect(await bars(page)).toBe(all);
});

test('the scissors choose another start, Exit leaves, and Shift+R and Escape do the same', async ({
  page,
}) => {
  await ready(page);
  const all = await bars(page);
  await start(page, 0.4);
  await replayBar(page)
    .getByRole('button', { name: 'Select the first bar' })
    .click();
  await expect(page.locator('[data-playhead="ready"]')).toHaveCount(0);
  const box = (await chart(page).boundingBox())!;
  await page.mouse.click(box.x + box.width * 0.2, box.y + box.height * 0.2);
  await expect(page.locator('[data-playhead="ready"]')).toBeAttached();
  await replayBar(page).getByRole('button', { name: 'Exit replay' }).click();
  await expect(replayBar(page)).toHaveCount(0);
  expect(await bars(page)).toBe(all);

  await page.keyboard.press('Shift+KeyR');
  await expect(replayBar(page)).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(replayBar(page)).toHaveCount(0);

  await page.keyboard.press('Shift+KeyR');
  await expect(replayBar(page)).toBeVisible();
  await page.keyboard.press('Shift+KeyR');
  await expect(replayBar(page)).toHaveCount(0);
});

test('the start can be chosen with the keyboard', async ({ page }) => {
  await ready(page);
  const all = await bars(page);
  await page.keyboard.press('Shift+KeyR');
  await chart(page).focus();
  await page.keyboard.press('Home');
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-playhead="ready"]')).toBeAttached();
  expect(await bars(page)).toBeLessThan(all * 0.1);
  await expect(flags(page)).toHaveCount(1);
});

test.describe('with reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('there is no autoplay: Play says why, and stepping by hand works', async ({
    page,
  }) => {
    await ready(page);
    await start(page, 0.3);
    const play = replayBar(page).getByRole('button', {
      name: 'Play',
      exact: true,
    });
    await expect(play).toHaveAttribute('aria-disabled', 'true');
    await expect(play).toHaveAccessibleDescription(/Autoplay is off/);
    const first = await bars(page);
    // aria-disabled, so Playwright would wait for it to be enabled: press it anyway, as a visitor can
    await play.click({ force: true });
    await page.waitForTimeout(800);
    expect(await bars(page)).toBe(first);
    await replayBar(page)
      .getByRole('button', { name: 'Step forward one bar' })
      .click();
    await expect.poll(() => bars(page)).toBe(first + 1);
    const glow = await page.evaluate(
      () =>
        document
          .querySelector('.tv-root')!
          .getAnimations({ subtree: true })
          .filter((a) => a.playState === 'running').length,
    );
    expect(glow).toBe(0);
  });
});

test.describe('in Vietnamese', () => {
  test('the replay bar and its messages speak Vietnamese', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
    await ready(page);
    await page
      .getByRole('button', { name: 'Phát lại từng nến' })
      .first()
      .click();
    await expect(page.getByTestId('tv-hint')).toContainText('Bấm vào biểu đồ');
    const box = (await chart(page).boundingBox())!;
    await page.mouse.click(box.x + box.width * 0.3, box.y + box.height * 0.2);
    await expect(
      page
        .getByRole('toolbar', { name: 'Phát lại từng nến' })
        .getByRole('button', { name: 'Phát', exact: true }),
    ).toBeVisible();
  });
});

test.describe('on a phone', () => {
  test.use({ viewport: { width: 390, height: 800 }, hasTouch: true });

  test('the replay bar fits the chart and its buttons are big enough for a finger', async ({
    page,
  }) => {
    await ready(page);
    await start(page, 0.4);
    const bar = (await replayBar(page).boundingBox())!;
    const box = (await chart(page).boundingBox())!;
    expect(bar.x).toBeGreaterThanOrEqual(box.x - 1);
    expect(bar.x + bar.width).toBeLessThanOrEqual(box.x + box.width + 1);
    for (const name of ['Play', 'Step forward one bar', 'Exit replay']) {
      const b = (await replayBar(page)
        .getByRole('button', { name, exact: true })
        .boundingBox())!;
      expect(b.height).toBeGreaterThanOrEqual(43);
    }
  });
});
