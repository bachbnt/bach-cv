/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { CSSProperties } from 'react';
import { cn } from '@/lib/utils';

/** A placeholder shape that shimmers while data loads (decoration: the block around it announces "Loading"). */
export function TlSkeleton({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      aria-hidden='true'
      style={style}
      className={cn(
        'relative overflow-hidden rounded-2xl bg-tl-chip after:absolute after:inset-0 after:animate-[tl-shimmer_1.4s_ease-in-out_infinite] after:bg-[linear-gradient(90deg,transparent,var(--tl-panel-2),transparent)] after:content-[""] after:[transform:translateX(-100%)]',
        className,
      )}
    />
  );
}

/** A column of rows (a list of roles, certificates or payments while it loads). */
export function TlRowsSkeleton({
  count = 3,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn('grid gap-3', className)}>
      {Array.from({ length: count }, (_, i) => (
        <TlSkeleton key={i} className='h-16' />
      ))}
    </div>
  );
}
