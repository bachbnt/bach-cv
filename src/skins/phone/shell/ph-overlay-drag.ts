/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/** How much of its height a sheet must be dragged down, as a fraction, to close. */
export const DISMISS_FRACTION = 1 / 3;

/** How fast a short flick down must be, in px per ms, to close the sheet whatever the distance. */
export const DISMISS_VELOCITY = 0.55;

/** How far a pointer must move, in px, before a press becomes a drag (below it the press is a tap and its click goes through). */
export const DRAG_SLOP = 6;

/** How far a sheet follows the pointer: down only, a drag up leaves it where it is. */
export const dragOffset = (dy: number): number => Math.max(0, dy);

/**
 * Whether a drag that moved `dy` px down in `elapsed` ms closes a sheet that is `extent` px high: more than a third of it, or a quick flick
 * (a flick of a few px is no gesture, so it still needs a short distance).
 */
export function dragDismisses(
  dy: number,
  elapsed: number,
  extent: number,
): boolean {
  if (dy <= 0 || extent <= 0) return false;
  if (dy > extent * DISMISS_FRACTION) return true;
  return dy > DRAG_SLOP * 4 && dy / Math.max(elapsed, 1) > DISMISS_VELOCITY;
}
