/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/** How long one arc of the ring takes to draw in (the arrival time of the skin's scale), and a bar to grow, and a number to count up, in ms. */
export const ARC_MS = 280;
export const BAR_MS = 600;
export const COUNT_MS = 700;

/** What waits before anything starts, so that the page's own entrance is over. */
export const BASE_DELAY = 160;

const ARC_STEP = 70;
/** The last arc starts at most this long after the first, so the whole ring is drawn in about 700 ms however many years it has. */
const ARC_SPAN = 420;
const BAR_STEP = 80;

/** The delay of each of `count` arcs, clockwise from the top: 70 ms apart, closer when there are many so that the ring still takes about the same time. */
export function arcDelays(count: number): number[] {
  const step = count > 1 ? Math.min(ARC_STEP, ARC_SPAN / (count - 1)) : 0;
  return Array.from(
    { length: count },
    (_, i) => BASE_DELAY + Math.round(i * step),
  );
}

/** The delay of each of `count` bars, top to bottom, 80 ms apart. */
export function barDelays(count: number): number[] {
  return Array.from({ length: count }, (_, i) => BASE_DELAY + i * BAR_STEP);
}

/** Slow at the end, as the arrival of everything in the skin is. */
export const easeOut = (t: number): number =>
  1 - (1 - Math.min(1, Math.max(0, t))) ** 3;

/** The whole number a count has reached `progress` (0 to 1) of the way to `target`. */
export const countAt = (target: number, progress: number): number =>
  Math.round(target * easeOut(progress));
