/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { CSSProperties } from 'react';
import { cn } from '@/lib/utils';

/** A placeholder shape with faint grid lines that shimmers while data loads (decoration: the block around it announces "Loading"). */
export function TvSkeleton({
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
        'relative overflow-hidden rounded-md border border-tv-line bg-tv-panel bg-[linear-gradient(var(--tv-grid)_1px,transparent_1px)] bg-[size:100%_25%] after:absolute after:inset-0 after:animate-[tv-shimmer_1.4s_ease-in-out_infinite] after:bg-[linear-gradient(90deg,transparent,var(--tv-hover),transparent)] after:content-[""] after:[transform:translateX(-100%)]',
        className,
      )}
    />
  );
}
