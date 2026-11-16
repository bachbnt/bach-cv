/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { CSSProperties } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from 'cn';

/** A grid of card-shaped blocks that wraps the way the real cards do (`min` is the narrowest card in px). */
export function CardsSkeleton({
  count,
  min,
  height,
  fit = 'fit',
  gap = 24,
  className,
  itemClassName,
}: {
  count: number;
  min: number;
  /** the height of a card, or leave it out and give a `h-*` class (with breakpoints) in `itemClassName` */
  height?: number;
  /** `fill` keeps the empty tracks of a row that is not full, as `auto-fill` does in the loaded grid */
  fit?: 'fit' | 'fill';
  gap?: number;
  className?: string;
  /** a lighter fill, for a block that sits on a grey band */
  itemClassName?: string;
}) {
  const style: CSSProperties = {
    gridTemplateColumns: `repeat(auto-${fit},minmax(min(100%,${min}px),1fr))`,
    gap,
  };
  return (
    <div className={cn('grid', className)} style={style}>
      {Array.from({ length: count }, (_, n) => (
        <Skeleton
          key={n}
          className={cn('rounded-2xl', itemClassName)}
          style={height === undefined ? undefined : { height }}
        />
      ))}
    </div>
  );
}
