/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import type { CSSProperties } from 'react';
import { useLoopGate } from '@/hooks/use-loop-gate';
import { cn } from '@/lib/utils';

/** A placeholder shape that shimmers while data loads (it is decoration: the surrounding block announces "Loading"). */
export function DevSkeleton({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  const gate = useLoopGate();
  return (
    <div
      ref={gate}
      aria-hidden='true'
      className={cn(
        'relative overflow-hidden rounded-[8px] border border-line-2 bg-chrome after:absolute after:inset-0 after:animate-[dv-shimmer_1.4s_ease-in-out_infinite] after:bg-[linear-gradient(90deg,transparent,var(--hover),transparent)] after:content-[""] after:[transform:translateX(-100%)]',
        className,
      )}
      style={style}
    />
  );
}

/** A grid of card-shaped placeholders that wraps the way the real cards do (`min` is the narrowest card in px). */
export function DevCardsSkeleton({
  count,
  min,
  height,
  gap = 14,
  className,
}: {
  count: number;
  min: number;
  height: number;
  gap?: number;
  className?: string;
}) {
  return (
    <div
      className={cn('grid', className)}
      style={{
        gap,
        gridTemplateColumns: `repeat(auto-fit, minmax(${min}px, 1fr))`,
      }}
    >
      {Array.from({ length: count }, (_, i) => (
        <DevSkeleton key={i} style={{ height }} />
      ))}
    </div>
  );
}
