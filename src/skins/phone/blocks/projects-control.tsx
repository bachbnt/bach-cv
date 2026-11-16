/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

/**
 * A round button at the end of the search row (the filters, the order): 48 px, one glyph, the name in `aria-label`. It lights up while what
 * it opened is open and (`data-active`) while it holds a choice. The buttons are raised under the bars before a popover opens (`scroll-mt`, on top of the scroll padding that every scroller of the skin has).
 */
export function ProjectsControl({
  className,
  type = 'button',
  ...props
}: ComponentProps<'button'>) {
  return (
    <button
      type={type}
      className={cn(
        'relative inline-grid size-12 shrink-0 scroll-mt-12 cursor-pointer touch-manipulation place-items-center rounded-full border-[1.5px] border-ph-line bg-ph-sheet-2 text-ph-ink transition-[scale,background-color,border-color] duration-100 select-none hover:bg-ph-sheet-3 active:scale-[0.94] active:bg-ph-sheet-3 data-active:border-ph-accent/60 data-active:text-ph-accent-ink data-popup-open:border-ph-accent',
        className,
      )}
      {...props}
    />
  );
}
