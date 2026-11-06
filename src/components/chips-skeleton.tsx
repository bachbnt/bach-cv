/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from 'cn';

/** A row of pill-shaped chips. */
export function ChipsSkeleton({
  count = 6,
  className,
}: {
  count?: number;
  className?: string;
}) {
  const widths = [88, 112, 76, 128, 96, 104, 84, 120];
  return (
    <div className={cn('flex flex-wrap gap-3', className)}>
      {Array.from({ length: count }, (_, n) => (
        <Skeleton
          key={n}
          className='h-9 rounded-full'
          style={{ width: widths[n % widths.length] }}
        />
      ))}
    </div>
  );
}
