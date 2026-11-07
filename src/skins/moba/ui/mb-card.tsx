/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

/**
 * A plaque: a dark panel with a gold edge and cut corners. `lift` makes it rise a little under the pointer (only where there is one);
 * leave it off for a box inside another card, a form or a row.
 */
export function MbCard({
  className,
  lift,
  ...props
}: ComponentProps<'div'> & { lift?: boolean }) {
  return (
    <div
      data-slot='mb-card'
      className={cn('mb-plaque', lift && 'mb-plaque-lift', className)}
      {...props}
    />
  );
}
