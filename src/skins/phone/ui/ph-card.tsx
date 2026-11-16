/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

/** A card on the screen of an app: the second surface, rounded like the tiles, with one soft shadow. */
export function PhCard({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot='ph-card'
      className={cn(
        'rounded-ph-panel bg-ph-sheet-2 p-4 shadow-ph-card',
        className,
      )}
      {...props}
    />
  );
}
