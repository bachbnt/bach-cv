/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

/** A placeholder block: a dark slab with a gold sheen that slides across it, still for reduced motion. */
export function MbSkeleton({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      aria-hidden='true'
      data-slot='mb-skeleton'
      className={cn('mb-skeleton h-6 w-full', className)}
      {...props}
    />
  );
}
