/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { cn } from '@/lib/utils';

/** A blank line, tag or picture inside a `DevSkeleton` card (decoration: the card around it is hidden from screen readers). */
export function DevSkeletonBar({ className }: { className?: string }) {
  return (
    <i
      aria-hidden='true'
      className={cn('block rounded-[4px] bg-line-2', className)}
    />
  );
}

/**
 * A blank value inside a line of code: `chars` letters wide in the font of the code, so it wraps where the real value would (an inline box, so it
 * is a bar of the same line height; the letters are transparent). It is decoration, like the window around it.
 */
export function DevSkeletonCode({ chars }: { chars: number }) {
  return (
    <i
      aria-hidden='true'
      className='rounded-[4px] bg-line-2 text-transparent not-italic select-none'
    >
      {'x'.repeat(chars)}
    </i>
  );
}
