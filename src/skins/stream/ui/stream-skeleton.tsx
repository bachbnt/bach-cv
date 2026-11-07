/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { CSSProperties } from 'react';
import { cn } from '@/lib/utils';

/** A placeholder shape that shimmers while data loads (decoration: the surrounding block announces "Loading"). */
export function StreamSkeleton({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      aria-hidden='true'
      className={cn(
        'relative overflow-hidden rounded-xl bg-sm-hover after:absolute after:inset-0 after:animate-[sm-shimmer_1.4s_ease-in-out_infinite] after:bg-[linear-gradient(90deg,transparent,var(--sm-hover2),transparent)] after:content-[""] after:[transform:translateX(-100%)]',
        className,
      )}
      style={style}
    />
  );
}

/** A grid of video-card placeholders as a video site shows them while it loads: a 16:9 picture, a round channel mark and two lines of text. It wraps like the real cards (`min` is the narrowest card in px). */
export function StreamCardsSkeleton({
  count,
  min,
  className,
}: {
  count: number;
  min: number;
  className?: string;
}) {
  return (
    <div
      className={cn('grid gap-x-4 gap-y-6', className)}
      style={{
        gridTemplateColumns: `repeat(auto-fill, minmax(min(100%, ${min}px), 1fr))`,
      }}
    >
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className='flex flex-col gap-3'>
          <StreamSkeleton className='aspect-video' />
          <div className='flex gap-3'>
            <StreamSkeleton className='size-9 flex-none rounded-full' />
            <div className='flex min-w-0 flex-1 flex-col gap-2 pt-0.5'>
              <StreamSkeleton className='h-4 w-11/12 rounded-md' />
              <StreamSkeleton className='h-3.5 w-3/5 rounded-md' />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
