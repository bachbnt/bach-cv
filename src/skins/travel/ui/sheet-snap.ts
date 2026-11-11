/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

// Where a bottom sheet that was dragged comes to rest (pure maths, no DOM).

/** The two heights of the sheet, as a share of the map: the short one that shows most of the map, and the tall one that shows the whole page. */
export const SHEET_SHORT = 0.46;
export const SHEET_TALL = 0.88;

/** A drag faster than this (px per ms) is a flick: it goes the way it was thrown, wherever it is let go. */
export const FLICK = 0.45;
/** A movement under this (px) is a tap, not a drag. */
export const SLOP = 6;

/** The height the sheet is dragged to: where it was grabbed plus how far the finger went up, kept between the two snap heights. */
export function draggedHeight(
  startHeight: number,
  rise: number,
  short: number,
  tall: number,
): number {
  return Math.min(tall, Math.max(short, startHeight + rise));
}

/**
 * Where a dragged sheet comes to rest: `true` for the tall height. A flick (`velocity` in px/ms, positive going up) decides by its
 * direction; a slow drag by whichever height is nearer.
 */
export function restsTall(
  height: number,
  velocity: number,
  short: number,
  tall: number,
): boolean {
  if (Math.abs(velocity) >= FLICK) return velocity > 0;
  return height >= (short + tall) / 2;
}
