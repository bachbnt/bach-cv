/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/** The window that holds a foldable device: at least this wide and this tall, or the screen is the window. */
export const DEVICE_MIN_WIDTH = 1100;
export const DEVICE_MIN_HEIGHT = 600;

/**
 * The device is drawn at one logical size and the whole of it is scaled to fit a smaller window, so the screen keeps the size its layout was
 * made for. A half is a screen of an A4 sheet in portrait (560 x 792, 1 : 1.414) in a bezel of 10 px, 580 x 812, with all four corners rounded
 * alike. Folded the device is ONE half, the right one, which carries the buttons (the cover screen, 560 wide, the phone layout). Open it is one
 * slab, 1140 x 812, with one continuous display across it (1120 wide, the tablet layout, two halves of 560) and the crease at its exact middle.
 */
export const DEVICE_WIDTH = 1140;
export const DEVICE_HEIGHT = 812;
/** the room left round a scaled device, per side, in px: a little at the sides, more above and below (the floor shadow and the Fold button need it) */
export const DEVICE_MARGIN_X = 12;
export const DEVICE_MARGIN_Y = 28;

/** How the screen sits in the window: inside a foldable device, or as the whole window (a phone, a tablet, a small desktop window). */
export type WindowMode = 'device' | 'full-bleed';

/** Which half of a foldable is in use: the inner screen (`open`, the tablet layout) or the cover screen (`folded`, the phone layout). */
export type Fold = 'open' | 'folded';

/** The localStorage key that remembers the fold. */
export const FOLD_KEY = 'bach-cv-phone-fold';

/** Whether the window has room for the device (scaled down if need be). */
export const windowMode = (width: number, height: number): WindowMode =>
  width >= DEVICE_MIN_WIDTH && height >= DEVICE_MIN_HEIGHT
    ? 'device'
    : 'full-bleed';

/** How much the open device is scaled to fit a window: never above 1, to the third decimal so that it changes only when it has to. */
export const deviceScale = (width: number, height: number): number =>
  Math.floor(
    Math.min(
      1,
      (width - 2 * DEVICE_MARGIN_X) / DEVICE_WIDTH,
      (height - 2 * DEVICE_MARGIN_Y) / DEVICE_HEIGHT,
    ) * 1000,
  ) / 1000;

/** What was stored, read as a fold: anything that is not `folded` is the default, open. */
export const parseFold = (stored: string | null): Fold =>
  stored === 'folded' ? 'folded' : 'open';

/** How far a drag on the edge of the device has to go, in px, to count as a fold or an unfold. */
export const FOLD_DRAG_PX = 60;

/** The fold a horizontal drag of `dx` px asks for: the free left edge of an open device dragged to the right folds it, of a folded one to the left opens it, a short drag asks for nothing. */
export const foldAfterDrag = (fold: Fold, dx: number): Fold | null => {
  if (fold === 'open' && dx >= FOLD_DRAG_PX) return 'folded';
  if (fold === 'folded' && dx <= -FOLD_DRAG_PX) return 'open';
  return null;
};
