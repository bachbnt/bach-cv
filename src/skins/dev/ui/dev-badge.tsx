/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

/** The label that sits on the bottom right corner of a cover (`6 screenshots`, `Enlarge`). The cover has to be `relative`. */
export function DevBadge({ className, ...props }: ComponentProps<'span'>) {
  return (
    <span
      data-slot='dev-badge'
      className={cn(
        'absolute right-2.5 bottom-2.5 inline-flex items-center gap-1.5 rounded-full bg-[color:color-mix(in_srgb,#000_72%,transparent)] px-2.5 py-1 font-code text-[12px] leading-[normal] font-semibold whitespace-nowrap text-white backdrop-blur-[6px]',
        className,
      )}
      {...props}
    />
  );
}
