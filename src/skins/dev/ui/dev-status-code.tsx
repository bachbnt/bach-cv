/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

/** The big code of a 404, Coming soon or maintenance screen. */
export function DevStatusCode({ className, ...props }: ComponentProps<'p'>) {
  return (
    <p
      data-slot='dev-status-code'
      className={cn(
        'mt-2.5 font-code text-[length:clamp(64px,12vw,110px)] leading-none font-bold tracking-[-0.04em] text-signal',
        className,
      )}
      {...props}
    />
  );
}
