/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/** The app bar does not start to follow the page until it is this far down, in px, so that the large title is not left without its bar at once. */
export const BAR_FOLLOW_AFTER = 32;

/** Where the app bar is: how far the page was last scrolled, and how far the bar has slid up from its place (`0` in place, `-height` out of sight). */
export interface BarFollow {
  top: number;
  y: number;
}

export const barStart = (top: number): BarFollow => ({ top, y: 0 });

/**
 * The bar of an app follows the page as a real navigation bar does: scrolling down by some px slides it up by as much, scrolling up slides it
 * back by as much (never past its place or past `height`, the distance that takes it out of sight), and at the top of the page it is in place.
 * It does not start to go before `BAR_FOLLOW_AFTER`.
 */
export function barFollow(
  state: BarFollow,
  top: number,
  height: number,
): BarFollow {
  const moved = top - state.top;
  if (top <= 0) return { top, y: 0 };
  if (moved > 0 && top <= BAR_FOLLOW_AFTER) return { top, y: state.y };
  return { top, y: Math.min(0, Math.max(-height, state.y - moved)) };
}

/**
 * What the bar does when the scrolling has stopped: it goes all the way into place or all the way out of sight. In place when the last move was UP
 * (the page was coming back, so the bar was too) or when it is more than half there; out of sight otherwise.
 */
export const barSettle = (y: number, height: number, up = false): number =>
  up || y > -height / 2 ? 0 : -height;

/** How much of the soft end of the bar's veil is seen: all of it until the bar is within `TAIL` px of being out of sight, then none, so that it never hangs from the top of the screen. */
export const BAR_TAIL = 16;
export const barTail = (y: number, height: number): number =>
  Math.min(1, Math.max(0, (y + height) / BAR_TAIL));

/** How opaque the bar is when it has slid up by `y`: it is gone before it is out of sight, so that nothing is seen half under the status bar. */
export const barOpacity = (y: number, height: number): number =>
  Math.min(1, Math.max(0, 1 + y / (height * 0.6)));

/** How opaque the large title is when `visible` of it (0 to 1) is below the app bar: gone before it reaches the text of the bar, so that it never reads through it. */
export const largeTitleOpacity = (visible: number): number =>
  Math.min(1, Math.max(0, (visible - 0.7) / 0.3)) ** 2;
