/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

/**
 * A toggle chip of the skin (a kind filter): outlined when off, inverted (ink on the page) when on. It is a button with
 * `aria-pressed`, so a screen reader says which filter is on.
 */
export function FilterChip({
  pressed,
  className,
  ...props
}: ComponentProps<'button'> & { pressed: boolean }) {
  return (
    <button
      type='button'
      data-slot='tl-filter'
      aria-pressed={pressed}
      className={cn(
        'inline-flex min-h-8 cursor-pointer items-center rounded-full border px-3.5 text-[13px] font-semibold transition-[background-color,color,transform] duration-150 select-none active:scale-[0.97] pointer-coarse:min-h-11',
        pressed
          ? 'border-tl-ink bg-tl-ink text-tl-solid'
          : 'border-tl-line bg-tl-panel-2 text-tl-ink hover:bg-tl-chip',
        className,
      )}
      {...props}
    />
  );
}
