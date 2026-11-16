/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/** How far a finger must travel sideways, in px, before a stroke counts as a swipe. */
export const SWIPE_DISTANCE = 48;

/**
 * Which way a stroke from one point to another steps through the pictures: `1` for the next (the finger went left), `-1` for the previous
 * (it went right) and `0` when the stroke was short or more up and down than sideways (a scroll, a tap).
 */
export function swipeStep(dx: number, dy: number): -1 | 0 | 1 {
  if (Math.abs(dx) < SWIPE_DISTANCE || Math.abs(dx) < Math.abs(dy) * 1.5)
    return 0;
  return dx < 0 ? 1 : -1;
}
