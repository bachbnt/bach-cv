/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/** The zoom steps of a picture, as a share of the size that fits the stage. */
export const PICTURE_ZOOMS = [1, 1.5, 2, 3, 4] as const;

/**
 * The step a key asks for in a window with zoom: `+` (or `=`) one step in, `-` one step out, `0` the fitting step. `null` for any other
 * key, so the window can go on with its own keys (the arrows step through the pictures).
 */
export function zoomFromKey(
  key: string,
  step: number,
  last: number,
  fit: number,
): number | null {
  const next =
    key === '+' || key === '='
      ? step + 1
      : key === '-'
        ? step - 1
        : key === '0'
          ? fit
          : null;
  return next === null ? null : Math.min(last, Math.max(0, next));
}
