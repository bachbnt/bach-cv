/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

/** A frosted card of the skin: the surface of a panel, a stop card, a ticket holder. */
export function TlCard({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot='tl-card'
      className={cn(
        'rounded-3xl border border-tl-line bg-tl-panel shadow-tl-card',
        className,
      )}
      {...props}
    />
  );
}

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
