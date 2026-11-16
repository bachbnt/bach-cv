/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { cn } from '@/lib/utils';

/** A blank line, chip or picture inside a `TlSkeleton` card (decoration: the card around it is hidden from screen readers). */
export function TlSkeletonBar({ className }: { className?: string }) {
  return (
    <i
      aria-hidden='true'
      className={cn('block rounded-md bg-tl-chip', className)}
    />
  );
}
