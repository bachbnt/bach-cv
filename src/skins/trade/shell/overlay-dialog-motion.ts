/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/** The backdrop of every window of the skin (the family dialogs and the symbol search): a plain dim, no blur. 160 ms like the window. */
export const TV_DIALOG_OVERLAY =
  'bg-black/55 duration-160 supports-backdrop-filter:backdrop-blur-none';

/**
 * How a window of the skin opens and closes: a quick fade and a scale from .96 (Base UI sets `data-starting-style` and
 * `data-ending-style`). One definition, so the dialogs and the symbol search feel the same.
 */
export const TV_DIALOG_MOTION =
  'transition-[opacity,scale] duration-160 ease-tv-state data-ending-style:scale-[.96] data-ending-style:opacity-0 data-starting-style:scale-[.96] data-starting-style:opacity-0 motion-reduce:transition-none';
