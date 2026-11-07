/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/** The round 40px button of the top bar (44px on touch): transparent, grey under the pointer, and when its menu is open. */
export const ICON_BUTTON =
  'inline-flex h-10 min-w-10 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-full text-sm-ink transition-colors hover:bg-sm-hover data-popup-open:bg-sm-hover aria-expanded:bg-sm-hover pointer-coarse:h-11 pointer-coarse:min-w-11 [&_svg]:size-5 [&_svg]:shrink-0';

/** The menus the three switches open: the popover colours of the skin, a little rounder than the shadcn default. */
export const MENU_CONTENT =
  'min-w-[200px] rounded-xl bg-sm-pop p-1.5 shadow-[0_8px_32px_rgba(0,0,0,.4)]';

/** An item of those menus. */
export const MENU_ITEM =
  'min-h-10 rounded-lg pr-9 pl-3 text-sm font-medium data-checked:font-bold';
