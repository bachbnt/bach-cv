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

const ready = async (page: Page) => {
  await gotoSkin(page, '/about');
  await expect(chart(page)).toHaveAttribute('data-candles', /^[1-9]/);
  // let the chart draw in and the live tick settle before measuring
  await page.waitForTimeout(1500);
};

interface Burst {
  /** the number of visible bars at each animation frame, from the one before the first event */
  counts: number[];
}

/**
 * Sends `deltas` as wheel events (one every `gap` ms, with `ctrl` for a pinch) on the plot and records the visible bar count at every
 * animation frame until it has not moved for 12 frames.
 */
const spin = (
  page: Page,
  options: { deltas: number[]; gap?: number; ctrl?: boolean; share?: number },
): Promise<Burst> =>
  chart(page).evaluate(
    (svg, { deltas, gap = 0, ctrl = false, share = 0.5 }) =>
      new Promise<Burst>((resolve) => {
        const box = svg.getBoundingClientRect();
        const send = (deltaY: number) =>
          svg.dispatchEvent(
            new WheelEvent('wheel', {
              deltaY,
              ctrlKey: ctrl,
              clientX: box.left + box.width * share,
              clientY: box.top + box.height * 0.3,
              bubbles: true,
              cancelable: true,
            }),
          );
        const read = () => Number(svg.getAttribute('data-candles'));
        const counts = [read()];
        let sent = 0;
        let still = 0;
        let nextAt = performance.now();
        const frame = (now: number) => {
          while (sent < deltas.length && now >= nextAt) {
            send(deltas[sent]);
            sent += 1;
            nextAt += gap;
          }
          // the count is read after React has had the frame to draw what the events queued
          requestAnimationFrame(() => {
            const count = read();
            still = count === counts[counts.length - 1] ? still + 1 : 0;
            counts.push(count);
            if (sent === deltas.length && still >= 12) resolve({ counts });
            else requestAnimationFrame(frame);
          });
        };
        requestAnimationFrame(frame);
      }),
    options,
  );

const steps = (counts: number[]) =>
  counts.slice(1).map((n, i) => n - counts[i]);

test('one notch of the wheel glides: a gentle change over many frames, never a jump', async ({
  page,
}) => {
  await ready(page);
  const start = await bars(page);
  // about 80 bars, the whole career on months
  expect(start).toBeGreaterThan(60);
  const { counts } = await spin(page, { deltas: [-100] });
  const end = counts[counts.length - 1];
  // zoom in: fewer bars, by less than 15 percent in all
  expect(end).toBeLessThan(start);
  expect(start - end).toBeLessThan(start * 0.15);
  // the change is spread over at least three frames and never reverses
  const changes = steps(counts).filter((d) => d !== 0);
  expect(changes.length).toBeGreaterThanOrEqual(3);
  for (const d of changes) expect(d).toBeLessThanOrEqual(0);
  // and no single frame is a jump
  for (const d of changes) expect(Math.abs(d)).toBeLessThanOrEqual(3);
  // a notch the other way brings it back to about where it was
  const back = await spin(page, { deltas: [100] });
  const after = back.counts[back.counts.length - 1];
  expect(Math.abs(after - start)).toBeLessThanOrEqual(3);
});

test('a burst of twenty events is one bounded glide, with no big step in any frame', async ({
  page,
}) => {
  await ready(page);
  const start = await bars(page);
  const { counts } = await spin(page, {
    deltas: Array(20).fill(-120),
    gap: 8,
  });
  const end = counts[counts.length - 1];
  expect(end).toBeLessThan(start);
  // the queue is capped, so a hard spin cannot run away: it does not reach the smallest window in one go
  expect(end).toBeGreaterThan(start * 0.1);
  // in any frame the bar count moves by a bounded share of what is on screen (a slow frame takes a bigger share, but never more than
  // the queue cap allows)
  const worst = Math.max(...steps(counts).map(Math.abs));
  expect(worst).toBeLessThanOrEqual(Math.ceil(start * 0.35));
  // the glide takes many frames
  expect(steps(counts).filter((d) => d !== 0).length).toBeGreaterThanOrEqual(8);
});

test('a trackpad (many small deltas) and a pinch (Ctrl) zoom smoothly and by a sensible amount', async ({
  page,
}) => {
  await ready(page);
  const start = await bars(page);
  const swipe = await spin(page, { deltas: Array(40).fill(-6), gap: 8 });
  const swiped = swipe.counts[swipe.counts.length - 1];
  expect(swiped).toBeLessThan(start * 0.95);
  expect(swiped).toBeGreaterThan(start * 0.5);
  for (const d of steps(swipe.counts)) expect(d).toBeLessThanOrEqual(0);
  const pinch = await spin(page, {
    deltas: Array(10).fill(5),
    gap: 16,
    ctrl: true,
  });
  const pinched = pinch.counts[pinch.counts.length - 1];
  expect(pinched).toBeGreaterThan(swiped);
  expect(pinched).toBeLessThan(swiped * 1.7);
});

test('the bar under the pointer stays under it while zooming', async ({
  page,
}) => {
  await ready(page);
  const box = (await chart(page).boundingBox())!;
  const under = async () => {
    await page.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.3);
    return page
      .getByTestId('tv-legend-date')
      .locator('span')
      .first()
      .innerText();
  };
  await page.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.3);
  const before = await under();
  await spin(page, { deltas: Array(5).fill(-100), gap: 16, share: 0.3 });
  const after = await under();
  // the same month (or a neighbour of it): the zoom is around the pointer
  expect(after).not.toBe('');
  expect(before).not.toBe('');
  const year = (text: string) => Number(text.match(/20\d\d/)?.[0]);
  expect(Math.abs(year(after) - year(before))).toBeLessThanOrEqual(1);
});

test('the time axis and the price scale can still be dragged, and a pinch still zooms', async ({
  page,
}) => {
  await ready(page);
  const box = (await chart(page).boundingBox())!;
  const all = await bars(page);
  // dragging along the time axis zooms
  const axisY = box.y + box.height - 10;
  await page.mouse.move(box.x + box.width * 0.5, axisY);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.5 + 160, axisY, { steps: 8 });
  await page.mouse.up();
  await expect.poll(() => bars(page)).not.toBe(all);
  // dragging the price scale takes "auto" off
  const auto = page.getByRole('button', { name: 'Auto fit the price scale' });
  await expect(auto).toHaveAttribute('aria-pressed', 'true');
  const x = box.x + box.width - 20;
  await page.mouse.move(x, box.y + box.height * 0.4);
  await page.mouse.down();
  await page.mouse.move(x, box.y + box.height * 0.4 + 60, { steps: 6 });
  await page.mouse.up();
  await expect(auto).toHaveAttribute('aria-pressed', 'false');
});

test.describe('without motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('the wheel applies what it asked for at once, once for each frame', async ({
    page,
  }) => {
    await ready(page);
    const start = await bars(page);
    const { counts } = await spin(page, { deltas: [-100, -100, -100] });
    const end = counts[counts.length - 1];
    expect(end).toBeLessThan(start);
    // all of it lands within a couple of frames, not over a glide
    const moving = steps(counts).filter((d) => d !== 0);
    expect(moving.length).toBeLessThanOrEqual(2);
  });
});

/** The date of the bar under the pointer at a share of the plot's width. */
const dateAt = async (page: Page, share: number) => {
  const box = (await chart(page).boundingBox())!;
  await page.mouse.move(box.x + box.width * share, box.y + box.height * 0.3);
  const text = await page
    .getByTestId('tv-legend-date')
    .locator('span')
    .first()
    .innerText();
  return { text, time: Date.parse(text) };
};

test('zooming in at the right edge and out again never slides the window back to the start of the chart', async ({
  page,
}) => {
  await ready(page);
  const first = (await dateAt(page, 0.002)).time;
  const total = await bars(page);
  expect(Number.isFinite(first)).toBe(true);
  let previous = first;
  // eight notches in, one at a time, each allowed to settle
  for (let i = 0; i < 8; i++) {
    await spin(page, { deltas: [-100], share: 0.85 });
    const left = (await dateAt(page, 0.002)).time;
    // the first visible date only moves later while the zoom is at the right edge
    expect(left).toBeGreaterThanOrEqual(previous);
    previous = left;
  }
  expect(previous).toBeGreaterThan(first);
  const zoomed = await bars(page);
  expect(zoomed).toBeLessThan(total * 0.5);
  // four notches out: the window opens to the left again, but never jumps to the first bar of the series
  for (let i = 0; i < 4; i++) {
    await spin(page, { deltas: [100], share: 0.85 });
    const left = (await dateAt(page, 0.002)).time;
    expect(left).toBeLessThanOrEqual(previous);
    expect(left).toBeGreaterThanOrEqual(first);
    previous = left;
  }
  expect(previous).toBeGreaterThan(first);
  expect(await bars(page)).toBeLessThan(total);
});

test('a change of the content while the visitor has zoomed keeps the window on the same dates, and the wheel goes on zooming', async ({
  page,
}) => {
  await ready(page);
  const total = await bars(page);
  await spin(page, { deltas: Array(4).fill(-100), gap: 30, share: 0.6 });
  // the bar count can stay the same while the window is still gliding: wait for it to arrive
  await page.waitForTimeout(900);
  const zoomed = await bars(page);
  expect(zoomed).toBeLessThan(total);
  const year = (text: string) => Number(text.match(/20\d\d/)?.[0]);
  const centre = year((await dateAt(page, 0.5)).text);
  const left = year((await dateAt(page, 0.002)).text);
  // the language lays other words over the content: new documents, and the series is built again
  await page.getByRole('button', { name: /^Language/ }).click();
  await page.getByRole('menuitemradio', { name: /Tiếng Việt/ }).click();
  await expect(
    page.getByRole('group', { name: 'Khung thời gian' }),
  ).toBeVisible();
  await page.waitForTimeout(500);
  expect(year((await dateAt(page, 0.5)).text)).toBe(centre);
  expect(year((await dateAt(page, 0.002)).text)).toBe(left);
  expect(Math.abs((await bars(page)) - zoomed)).toBeLessThanOrEqual(1);
  // and the wheel still zooms, from where it is
  const { counts } = await spin(page, {
    deltas: Array(10).fill(-100),
    gap: 16,
    share: 0.5,
  });
  expect(counts[counts.length - 1]).toBeLessThan(zoomed * 0.75);
  expect(year((await dateAt(page, 0.5)).text)).toBe(centre);
});

test('the wheel zooms even when a flag is under the pointer', async ({
  page,
}) => {
  await ready(page);
  // a flag is an HTML button on top of the chart: the wheel over it must still zoom (it used to be lost)
  const flag = page.locator('[data-marker]').first();
  await expect(flag).toBeVisible();
  const box = (await flag.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  const start = await bars(page);
  await page.mouse.wheel(0, -100);
  await expect.poll(() => bars(page)).toBeLessThan(start);
  // and over a graduation flag
  const cap = (await page.locator('[data-degree]').first().boundingBox())!;
  await page.mouse.move(cap.x + cap.width / 2, cap.y + cap.height / 2);
  const mid = await bars(page);
  await page.mouse.wheel(0, 100);
  await expect.poll(() => bars(page)).toBeGreaterThan(mid);
});
