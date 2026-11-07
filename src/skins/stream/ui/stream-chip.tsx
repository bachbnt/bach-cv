/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

const base =
  'inline-flex h-8 shrink-0 items-center rounded-lg px-3 text-sm font-medium whitespace-nowrap pointer-coarse:h-11';

/** A chip that filters or jumps: grey, and light-on-dark when it is on (`aria-pressed`). */
export function StreamChip({
  className,
  type = 'button',
  ...props
}: ComponentProps<'button'>) {
  return (
    <button
      type={type}
      data-slot='stream-chip'
      className={cn(
        base,
        'cursor-pointer bg-sm-chip text-sm-ink transition-colors hover:bg-sm-hover2 aria-pressed:bg-sm-chip-on aria-pressed:text-sm-chip-on-ink',
        className,
      )}
      {...props}
    />
  );
}

/** A chip that only labels (a technology, a kind). */
export function StreamTag({ className, ...props }: ComponentProps<'span'>) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full bg-sm-hover2 px-2.5 py-0.5 text-xs text-sm-ink',
        className,
      )}
      {...props}
    />
  );
}
