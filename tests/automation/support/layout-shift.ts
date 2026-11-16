/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { Page } from '@playwright/test';

/**
 * Holds the reads of the collections (`runQuery`) until `release()`, so a test can look at the loading skeleton and then at the loaded page
 * of the same state. Call it after `mockFirestore`: the held reads go on to that mock. The documents read one by one (`site/live`) are not
 * held, so the page chrome and the owner's switches are the real ones in both states.
 */
export async function holdData(page: Page) {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/firestore.googleapis.com/**', async (route) => {
    if (route.request().url().includes(':runQuery')) await gate;
    return route.fallback();
  });
  return { release };
}

export type Box = { x: number; y: number; w: number; h: number };
export type Snapshot = {
  /** the height of the thing that scrolls the page (the document, or the screen of a skin that scrolls inside itself) */
  scrollHeight: number;
  /** the page chrome: headings, tabs, buttons and links with their text, by `tag|text|nth` */
  chrome: Record<string, Box>;
  /** every placeholder shape on the page (inside a busy block) */
  shapes: Box[];
  /** the box of the parent of each busy block (it holds the block and, once the data is there, the data), by index */
  slots: Record<string, Box>;
  /** how many animations still run inside the busy blocks (a shimmer or a pulse) */
  running: number;
};

/** Reads the boxes of the page chrome and of the placeholder shapes, in page coordinates (no scrolling is done). */
export async function snapshot(page: Page): Promise<Snapshot> {
  return page.evaluate(() => {
    const round = (n: number) => Math.round(n * 10) / 10;
    const box = (el: Element): Box => {
      const r = el.getBoundingClientRect();
      return {
        x: round(r.x),
        y: round(r.y),
        w: round(r.width),
        h: round(r.height),
      };
    };
    let scrollHeight = document.documentElement.scrollHeight;
    for (const el of document.querySelectorAll<HTMLElement>('*')) {
      if (el.scrollHeight <= el.clientHeight + 1 || el.clientHeight < 200)
        continue;
      const overflow = getComputedStyle(el).overflowY;
      if (overflow === 'auto' || overflow === 'scroll')
        scrollHeight = Math.max(scrollHeight, el.scrollHeight);
    }
    const busy = [...document.querySelectorAll('[aria-busy="true"]')];
    // the parent of a busy block is marked, so the same element is read again when the data has taken the block's place
    busy.forEach((b, i) =>
      b.parentElement?.setAttribute('data-shift-slot', String(i)),
    );
    const slots: Record<string, Box> = {};
    for (const el of document.querySelectorAll('[data-shift-slot]'))
      slots[el.getAttribute('data-shift-slot') ?? ''] = box(el);
    const seen = new Map<string, number>();
    const chrome: Record<string, Box> = {};
    for (const el of document.querySelectorAll(
      'h1,h2,h3,h4,[role="tab"],a[href],button',
    )) {
      if (busy.some((b) => b.contains(el))) continue;
      const text = (el.textContent ?? '').trim().replace(/\s+/g, ' ');
      const r = el.getBoundingClientRect();
      if (!text || r.width === 0 || r.height === 0) continue;
      const base = `${el.tagName.toLowerCase()}|${text.slice(0, 40)}`;
      const n = seen.get(base) ?? 0;
      seen.set(base, n + 1);
      chrome[`${base}|${n}`] = box(el);
    }
    const shapes: Box[] = [];
    for (const b of busy)
      for (const el of b.querySelectorAll('[aria-hidden="true"]')) {
        const r = el.getBoundingClientRect();
        // the leaves only: a shape that holds other shapes is a layout wrapper
        if (
          r.width > 0 &&
          r.height > 0 &&
          !el.querySelector('[aria-hidden="true"]')
        )
          shapes.push(box(el));
      }
    const running = busy.reduce(
      (sum, b) =>
        sum +
        (b as HTMLElement)
          .getAnimations({ subtree: true })
          .filter((a) => a.playState === 'running').length,
      0,
    );
    return { scrollHeight, chrome, shapes, slots, running };
  });
}

/** Waits until two reads of the boxes, a little apart, are the same (reveals and fades are over). */
export async function settled(page: Page): Promise<Snapshot> {
  let last = JSON.stringify(await snapshot(page));
  for (let i = 0; i < 20; i++) {
    await page.waitForTimeout(150);
    const next = JSON.stringify(await snapshot(page));
    if (next === last) break;
    last = next;
  }
  return JSON.parse(last) as Snapshot;
}

export type Shift = {
  /** the largest vertical move of a piece of page chrome that is in both states */
  maxDy: number;
  /** the largest horizontal move, or a width that changed */
  maxDx: number;
  /** the page chrome that moved most, `tag|text|nth` */
  worst: string;
  /** loaded minus skeleton, the height of what scrolls */
  dHeight: number;
  matched: number;
  /** the largest change of height, and of width, of the place a busy block holds (what the skeleton stood for) */
  slotDh: number;
  slotDw: number;
};

/** What moved, from the page with the skeleton to the page with its data. */
export function shiftBetween(before: Snapshot, after: Snapshot): Shift {
  let maxDy = 0;
  let maxDx = 0;
  let worst = '';
  let matched = 0;
  for (const [key, a] of Object.entries(before.chrome)) {
    const b = after.chrome[key];
    if (!b) continue;
    matched++;
    const dy = Math.abs(b.y - a.y) + Math.abs(b.h - a.h);
    const dx = Math.abs(b.x - a.x) + Math.abs(b.w - a.w);
    if (dy > maxDy) {
      maxDy = dy;
      worst = key;
    }
    maxDx = Math.max(maxDx, dx);
  }
  let slotDh = 0;
  let slotDw = 0;
  for (const [key, a] of Object.entries(before.slots)) {
    const b = after.slots[key];
    if (!b) continue;
    slotDh = Math.max(slotDh, Math.abs(b.h - a.h));
    slotDw = Math.max(slotDw, Math.abs(b.w - a.w));
  }
  return {
    slotDh: Math.round(slotDh),
    slotDw: Math.round(slotDw),
    maxDy: Math.round(maxDy * 10) / 10,
    maxDx: Math.round(maxDx * 10) / 10,
    worst,
    dHeight: Math.round(after.scrollHeight - before.scrollHeight),
    matched,
  };
}
