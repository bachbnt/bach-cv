/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

/** A line of chalk that is not written yet: a pale bar that a faint light (the ink of the board, a little of it) sweeps across. Decoration only (the loading state is announced once). */
export function AcSkeleton({
  as: Tag = 'div',
  className,
  ...props
}: ComponentProps<'div'> & {
  /** `span` for a bar inside a paragraph, where a `div` is not allowed */
  as?: 'div' | 'span';
}) {
  return (
    <Tag
      aria-hidden='true'
      className={cn(
        'relative h-4 overflow-hidden rounded-[3px] bg-ac-faint after:absolute after:inset-0 after:-translate-x-full after:animate-[ac-shimmer_1.4s_ease-in-out_infinite] after:bg-[linear-gradient(90deg,transparent,color-mix(in_oklab,var(--ac-ink)_14%,transparent),transparent)] after:content-[""]',
        className,
      )}
      {...props}
    />
  );
}
