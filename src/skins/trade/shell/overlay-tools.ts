/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/** An icon button of the toolbar of a window: 32px, 44px for touch. */
export const TOOL_BUTTON =
  'grid size-8 flex-none cursor-pointer place-items-center rounded text-tv-ink transition-[background-color,scale] duration-100 hover:bg-tv-hover active:scale-90 active:bg-tv-hover disabled:pointer-events-none disabled:opacity-40 pointer-coarse:size-11';

/** The zoom steps of a picture, as a share of the size that fits the stage. */
export const PICTURE_ZOOMS = [1, 1.5, 2, 3, 4] as const;

/**
 * The step a key asks for in a window with zoom: `+` (or `=`) one step in, `-` one step out, `0` the fitting step. `null` for any other key,
 * so the window can go on with its own keys (the arrows step through the pictures).
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
