/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

/** A line of chalk that is not written yet: a pale bar that a light sweeps across. Decoration only (the loading state is announced once). */
export function AcSkeleton({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      aria-hidden='true'
      className={cn(
        'relative h-4 overflow-hidden rounded-[3px] bg-ac-faint after:absolute after:inset-0 after:-translate-x-full after:animate-[ac-shimmer_1.4s_ease-in-out_infinite] after:bg-[linear-gradient(90deg,transparent,rgb(255_255_255/0.18),transparent)] after:content-[""]',
        className,
      )}
      {...props}
    />
  );
}
