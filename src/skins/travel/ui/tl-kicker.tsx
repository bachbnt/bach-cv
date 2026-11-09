/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

/** The small caps line above a title (a kicker in coral). */
export function TlKicker({ className, ...props }: ComponentProps<'p'>) {
  return (
    <p
      className={cn(
        'm-0 text-[11.5px] font-extrabold tracking-[1px] text-tl-coral uppercase',
        className,
      )}
      {...props}
    />
  );
}
