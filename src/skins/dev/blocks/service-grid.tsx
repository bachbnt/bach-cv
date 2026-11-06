/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

/** Three columns, two on a tablet, one on a phone: the grid of the service cards and of their placeholders. */
export function ServiceGrid({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'grid grid-cols-[repeat(3,1fr)] gap-4 max-[900px]:grid-cols-[repeat(2,1fr)] max-[620px]:grid-cols-[1fr]',
        className,
      )}
      {...props}
    />
  );
}
