/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ComponentProps } from 'react';
import { cn } from 'cn';

/** A grey placeholder block. Size and shape come from `className`; it pulses unless the visitor prefers reduced motion. */
export function Skeleton({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot='skeleton'
      aria-hidden='true'
      className={cn('rounded-xl bg-muted motion-safe:animate-pulse', className)}
      {...props}
    />
  );
}
