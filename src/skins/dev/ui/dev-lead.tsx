/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

/** The line of prose under the big heading of a terminal card (the intro of a page, the words of a 404 or maintenance screen). */
export function DevLead({ className, ...props }: ComponentProps<'p'>) {
  return (
    <p
      data-slot='dev-lead'
      className={cn(
        'mb-[18px] max-w-[640px] font-sans text-[17px]/[1.65] font-normal text-mute',
        className,
      )}
      {...props}
    />
  );
}
