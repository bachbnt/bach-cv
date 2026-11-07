/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

/**
 * The root of a Trade window (the terminal, the maintenance screen): the colours and the base type of the skin. `tv-root` is the
 * scope of the rules in `trade.css`.
 */
export function TvRoot({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-skin-root='trade'
      className={cn(
        'tv-root bg-tv-bg text-[13px]/[1.35] text-tv-ink antialiased',
        className,
      )}
      {...props}
    />
  );
}
