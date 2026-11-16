/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/** How close to the left edge of the screen a swipe back starts, in px. */
export const EDGE_PX = 24;
/** How far a swipe has to travel to count, in px. */
export const SWIPE_PX = 70;
/** How far a drag up on the home bar or a drag down on the status bar has to travel, in px. */
export const PULL_PX = 48;

/** Whether a touch at `x` starts at the left edge of a screen whose left side is at `left`. */
export const startsAtEdge = (x: number, left: number): boolean =>
  x >= left && x - left <= EDGE_PX;

/** A swipe to the right that is mostly horizontal: back. */
export const isBackSwipe = (dx: number, dy: number): boolean =>
  dx >= SWIPE_PX && Math.abs(dy) <= dx / 2;

/** A drag up that is mostly vertical: home. */
export const isUpDrag = (dx: number, dy: number): boolean =>
  -dy >= PULL_PX && Math.abs(dx) <= -dy;

/** A drag down that is mostly vertical: the shade. */
export const isDownDrag = (dx: number, dy: number): boolean =>
  dy >= PULL_PX && Math.abs(dx) <= dy;
