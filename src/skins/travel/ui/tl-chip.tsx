/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

/** A small tag: a technology, a topic, a period. With `color` (1 to 6) it takes the colour of a stop. */
export function TlChip({
  color,
  className,
  style,
  ...props
}: Omit<ComponentProps<'span'>, 'color'> & { color?: number }) {
  return (
    <span
      data-slot='tl-chip'
      style={
        color
          ? ({
              ...style,
              '--tl-pc': `var(--tl-stop-${color})`,
            } as ComponentProps<'span'>['style'])
          : style
      }
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold',
        color
          ? 'border border-[color-mix(in_srgb,var(--tl-pc)_32%,transparent)] bg-[color-mix(in_srgb,var(--tl-pc)_15%,transparent)] text-tl-ink before:size-1.5 before:rotate-45 before:rounded-[2px] before:bg-[var(--tl-pc)] before:content-[""]'
          : 'bg-tl-chip text-tl-chip-ink',
        className,
      )}
      {...props}
    />
  );
}
