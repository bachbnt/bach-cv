/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import type { CSSProperties, ReactNode } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { statesCopy } from '@/content/copy/states';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from 'cn';

/** Wraps skeleton blocks so a screen reader hears one "Loading" instead of nothing. */
export function LoadingBlock({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const copy = useCopy(statesCopy);
  return (
    <div
      role='status'
      aria-busy='true'
      aria-label={copy.loading}
      className={className}
    >
      {children}
    </div>
  );
}

/** A grid of card-shaped blocks that wraps the way the real cards do (`min` is the narrowest card in px). */
export function CardsSkeleton({
  count,
  min,
  height,
  gap = 24,
  className,
  itemClassName,
}: {
  count: number;
  min: number;
  height: number;
  gap?: number;
  className?: string;
  /** a lighter fill, for a block that sits on a grey band */
  itemClassName?: string;
}) {
  const style: CSSProperties = {
    gridTemplateColumns: `repeat(auto-fit,minmax(min(100%,${min}px),1fr))`,
    gap,
  };
  return (
    <div className={cn('grid', className)} style={style}>
      {Array.from({ length: count }, (_, n) => (
        <Skeleton
          key={n}
          className={cn('rounded-2xl', itemClassName)}
          style={{ height }}
        />
      ))}
    </div>
  );
}

/** Rows like the experience list: a logo, a company and role, a period. */
export function RowsSkeleton({
  count = 3,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={className}>
      {Array.from({ length: count }, (_, n) => (
        <div
          key={n}
          className='flex flex-wrap items-center gap-x-8 gap-y-3 border-b px-3 py-5 min-[721px]:px-6 min-[721px]:py-6'
        >
          <Skeleton className='h-20 w-28 flex-none rounded-[10px]' />
          <Skeleton className='h-7 w-[230px] max-w-full' />
          <div className='flex min-w-0 flex-[1_1_320px] flex-col gap-2'>
            <Skeleton className='h-5 w-3/5' />
            <Skeleton className='h-4 w-4/5' />
          </div>
          <Skeleton className='h-4 w-[170px] max-w-full' />
        </div>
      ))}
    </div>
  );
}

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
