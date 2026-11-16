/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { expect, test, type Page } from '@playwright/test';
import { mockFirestore } from '../support/firestore-mock';
import { mockImages } from '../support/images';
import { gotoSkin, useSkin } from '../support/skin';
import {
  DANGER_AT,
  SIGNAL_MAX,
  TICK_MS,
  WIFI_MAX,
} from '@/skins/phone/shell/status-sim';

// The glyphs of the status bar are alive: the mobile data and the Wi-Fi rise and fall, the battery drains, is charged and drains again. It is decoration, driven by
// one timer, so the clock of the page is faked here and wound forward a tick (half a second) at a time.

const START = Date.parse('2026-06-01T10:00:00Z');

test.beforeEach(async ({ page }) => {
  await useSkin(page, 'phone');
  await mockFirestore(page);
  await mockImages(page);
  await page.setViewportSize({ width: 1440, height: 900 });
});

interface Reading {
  level: number;
  charging: boolean;
  /** `fast`, `normal`, or '' while the charger is out */
  charge: string;
  tone: string;
  signal: number;
  wifi: number;
  /** the bolts that are drawn (none, one for a normal charge, two for a fast one), and the colour the fill is drawn in */
  bolts: number;
  fill: string;
}

/** What the glyphs of the bar say and show now. */
const read = (page: Page): Promise<Reading> =>
  page.evaluate(() => {
    const attribute = (selector: string, name: string) =>
      document.querySelector(selector)?.getAttribute(name) ?? '';
    const battery = document.querySelector('[data-ph-battery]');
    const rects = battery?.querySelectorAll('rect');
    const fill = rects?.[1];
    const bolts = [...(battery?.querySelectorAll('[data-ph-bolt]') ?? [])];
    return {
      level: Number(attribute('[data-ph-battery]', 'data-level')),
      charging: attribute('[data-ph-battery]', 'data-charge') !== '',
      charge: attribute('[data-ph-battery]', 'data-charge'),
      tone: attribute('[data-ph-battery]', 'data-tone'),
      signal: Number(attribute('[data-ph-signal]', 'data-level')),
      wifi: Number(attribute('[data-ph-wifi]', 'data-level')),
      bolts: bolts.filter(
        (bolt) => Number(getComputedStyle(bolt).opacity) > 0.9,
      ).length,
      fill: fill ? getComputedStyle(fill).fill : '',
    };
  });

/** The colour of a token, as the browser spells it. */
const token = (page: Page, name: string) =>
  page.evaluate((property) => {
    const probe = document.createElement('span');
    probe.style.color = `var(${property})`;
    document.body.appendChild(probe);
    const color = getComputedStyle(probe).color;
    probe.remove();
    return color;
  }, name);

const open = async (page: Page, path = '/about') => {
  await page.clock.install({ time: START });
  await gotoSkin(page, path);
  await expect(page.locator('[data-ph-battery]').first()).toBeVisible();
};

/** Winds the clock on, a tick at a time, until `done` is true of what the glyphs say; every reading is kept. */
async function until(
  page: Page,
  seen: Reading[],
  done: (reading: Reading) => boolean,
  ticks: number,
): Promise<Reading> {
  for (let i = 0; i < ticks; i++) {
    await page.clock.runFor(TICK_MS);
    const reading = await read(page);
    seen.push(reading);
    if (done(reading)) return reading;
  }
  throw new Error(
    `not there after ${ticks} ticks: ${JSON.stringify(seen.at(-1))}`,
  );
}

test('the battery tells its story: drains, red at 20%, charged green with a bolt at 1%, back to 100% and drains again; the signal moves a step at a time', async ({
  page,
}) => {
  test.setTimeout(240_000);
  await open(page);
  // `seen` is one reading for each tick, from the fall of the first 30 s on
  const seen: Reading[] = [];
  const first = await read(page);
  // a full battery in the ink of the bar (the page may have had a few seconds before the fake clock is wound)
  expect(first.level).toBeGreaterThanOrEqual(90);
  expect(first.charging).toBe(false);
  expect(first.tone).toBe('ink');
  expect(first.bolts).toBe(0);

  // it drains by about 1% every 1.5 s: 30 s are 20%
  await page.clock.runFor(30_000);
  const after = await read(page);
  expect(first.level - after.level).toBeGreaterThanOrEqual(19);
  expect(first.level - after.level).toBeLessThanOrEqual(21);

  // red from 20% down, drawn in the danger colour
  const danger = await until(page, seen, (r) => r.level <= DANGER_AT, 700);
  expect(danger.tone).toBe('danger');
  expect(danger.charge).toBe('');
  await page.waitForTimeout(450);
  expect((await read(page)).fill).toBe(await token(page, '--ph-danger'));
  const low = await until(page, seen, (r) => r.level <= 5, 400);
  expect(low.tone).toBe('danger');
  expect(low.charging).toBe(false);

  // at 1% the charger is in: green, FAST, with the double bolt
  const plugged = await until(page, seen, (r) => r.charging, 40);
  const pluggedAt = seen.length;
  expect(plugged.level).toBeLessThanOrEqual(2);
  expect(plugged.tone).toBe('ok');
  expect(plugged.charge).toBe('fast');
  await page.waitForTimeout(450);
  const charging = await read(page);
  expect(charging.bolts).toBe(2);
  expect(charging.fill).toBe(await token(page, '--ph-ok'));

  // from 80% it is a NORMAL charge: the same green, one bolt
  const normal = await until(page, seen, (r) => r.charge === 'normal', 200);
  const normalAt = seen.length;
  expect(normal.level).toBe(80);
  expect(normal.tone).toBe('ok');
  await page.waitForTimeout(450);
  const plain = await read(page);
  expect(plain.bolts).toBe(1);
  expect(plain.fill).toBe(await token(page, '--ph-ok'));

  // 100%: the charger stays in for a moment, then it is out, the bolt goes and it drains again
  const full = await until(page, seen, (r) => r.level === 100, 200);
  const fullAt = seen.length;
  expect(full.charging).toBe(true);
  expect(full.charge).toBe('normal');
  // a percent takes longer in the normal charge than in the fast one
  expect((fullAt - normalAt) / 20).toBeGreaterThan((normalAt - pluggedAt) / 79);
  const unplugged = await until(page, seen, (r) => !r.charging, 30);
  expect(unplugged.level).toBe(100);
  expect(unplugged.tone).toBe('ink');
  await page.waitForTimeout(450);
  expect((await read(page)).bolts).toBe(0);
  const again = await until(page, seen, (r) => r.level === 99, 30);
  expect(again.charging).toBe(false);
  expect(again.tone).toBe('ink');

  // the whole time: the signal and the Wi-Fi stay in their range, move one step at a time, and do move
  for (const [index, reading] of seen.entries()) {
    expect(reading.signal).toBeGreaterThanOrEqual(1);
    expect(reading.signal).toBeLessThanOrEqual(SIGNAL_MAX);
    expect(reading.wifi).toBeGreaterThanOrEqual(1);
    expect(reading.wifi).toBeLessThanOrEqual(WIFI_MAX);
    if (index === 0) continue;
    expect(
      Math.abs(reading.signal - seen[index - 1].signal),
    ).toBeLessThanOrEqual(1);
    expect(Math.abs(reading.wifi - seen[index - 1].wifi)).toBeLessThanOrEqual(
      1,
    );
  }
  expect(new Set(seen.map((r) => r.signal)).size).toBeGreaterThan(1);
  expect(new Set(seen.map((r) => r.wifi)).size).toBeGreaterThan(1);
});

test('the quick settings read the same state out, in words, and the bar announces nothing', async ({
  page,
}) => {
  await open(page);
  // nothing of the bar is a live region
  await expect(page.locator('[data-ph-body] [aria-live]')).toHaveCount(0);
  await page.clock.runFor(30_000);
  await page.getByRole('button', { name: 'Quick settings' }).click();
  const summary = page.locator('[data-ph-status-summary]');
  await expect(summary).toHaveCount(1);
  const bar = await read(page);
  await expect(summary).toHaveText(
    new RegExp(
      `^Battery ${bar.level}%\\. Mobile data, \\d of 4 bars\\. Wi-Fi, \\d of 3\\.$`,
    ),
  );
  await expect(summary).toHaveAttribute('data-level', String(bar.level));
  await expect(summary).not.toHaveAttribute('aria-live');
});

test('the words of the quick settings are in Vietnamese in Vietnamese, and say that it is charging', async ({
  page,
}) => {
  await page.addInitScript(() => localStorage.setItem('bach-cv-lang', 'vi'));
  await open(page);
  const seen: Reading[] = [];
  await page.getByRole('button', { name: 'Cài đặt nhanh' }).click();
  await expect(page.locator('[data-ph-status-summary]')).toHaveText(
    /^Pin \d+%\. Dữ liệu di động, \d trên 4 vạch\. Wi-Fi, \d trên 3 vạch\.$/,
  );
  // to the charger: Esc closes the shade (its tick does not need it to be open)
  await page.keyboard.press('Escape');
  await until(page, seen, (r) => r.charging, 1000);
  await page.getByRole('button', { name: 'Cài đặt nhanh' }).click();
  await expect(page.locator('[data-ph-status-summary]')).toContainText(
    'Sạc nhanh',
  );
});

test('the quick settings say "Fast charging" below 80% and "Charging" from there on', async ({
  page,
}) => {
  test.setTimeout(120_000);
  await open(page);
  const seen: Reading[] = [];
  const shade = page.getByRole('button', { name: 'Quick settings' });
  /** the words of the shade, and the level and the mode they were read with (the clock goes on while a test looks) */
  const said = () =>
    page.evaluate(() => {
      const element = document.querySelector('[data-ph-status-summary]');
      return {
        text: element?.textContent?.split('.')[0] ?? '',
        level: element?.getAttribute('data-level') ?? '',
        charge: element?.getAttribute('data-charge') ?? '',
      };
    });
  await until(page, seen, (r) => r.charge === 'fast', 1200);
  await until(page, seen, (r) => r.level >= 34, 60);
  await shade.click();
  await page.locator('[data-ph-status-summary]').waitFor();
  const fast = await said();
  expect(fast.charge).toBe('fast');
  expect(fast.text).toBe(`Fast charging, ${fast.level}%`);
  await page.keyboard.press('Escape');
  await until(page, seen, (r) => r.level >= 91, 400);
  await shade.click();
  await page.locator('[data-ph-status-summary]').waitFor();
  const normal = await said();
  expect(normal.charge).toBe('normal');
  expect(normal.text).toBe(`Charging, ${normal.level}%`);
});

test('a hidden tab stands still, and goes on when it is shown again', async ({
  page,
}) => {
  await open(page);
  const hide = (hidden: boolean) =>
    page.evaluate((value) => {
      Object.defineProperty(document, 'hidden', {
        configurable: true,
        get: () => value,
      });
      document.dispatchEvent(new Event('visibilitychange'));
    }, hidden);
  await hide(true);
  const stopped = await read(page);
  await page.clock.runFor(60_000);
  const still = await read(page);
  expect(still.level).toBe(stopped.level);
  expect(still.signal).toBe(stopped.signal);
  await hide(false);
  await page.clock.runFor(30_000);
  expect(stopped.level - (await read(page)).level).toBeGreaterThanOrEqual(19);
});

test('with reduced motion the glyphs are still: a full battery, the best signal', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open(page);
  await page.clock.runFor(120_000);
  const reading = await read(page);
  expect(reading).toMatchObject({
    level: 100,
    charging: false,
    tone: 'ink',
    signal: SIGNAL_MAX,
    wifi: WIFI_MAX,
  });
});
