/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

/** A filter chip: handwritten, outlined by hand; pressed, it is marked like a line under a highlighter. */
export function AcChip({
  className,
  type = 'button',
  ...props
}: ComponentProps<'button'>) {
  return (
    <button
      data-slot='ac-chip'
      type={type}
      className={cn(
        'inline-flex min-h-8 cursor-pointer items-center rounded-[16px_11px_15px_12px/12px_15px_11px_16px] border-2 border-ac-rule bg-transparent px-3.5 pt-1 pb-[5px] font-ac-note text-[17px] leading-[1.15] text-ac-ink transition-colors hover:border-ac-mute aria-pressed:border-ac-md aria-pressed:bg-ac-hit aria-pressed:shadow-[inset_0_-7px_0_var(--ac-hit)] pointer-coarse:min-h-11',
        className,
      )}
      {...props}
    />
  );
}
