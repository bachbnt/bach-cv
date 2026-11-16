/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

/** A line or a block that is not there yet: a pale shape that a light sweeps across. Decoration only (the loading state is announced once). */
export function PhSkeleton({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      aria-hidden='true'
      className={cn(
        'relative h-4 overflow-hidden rounded-full bg-ph-sheet-3 after:absolute after:inset-0 after:-translate-x-full after:animate-ph-shimmer after:bg-[linear-gradient(90deg,transparent,var(--ph-glass),transparent)] after:content-[""]',
        className,
      )}
      {...props}
    />
  );
}
