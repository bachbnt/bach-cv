/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** The red badge with a pulsing white dot: the job I am in now, with the Standard "Current" word. The dot stands still for reduced motion. */
export function LiveBadge({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-sm bg-sm-red px-2 py-0.5 text-xs font-bold tracking-wide text-white uppercase',
        className,
      )}
    >
      <span
        aria-hidden='true'
        className='size-[7px] animate-[sm-pulse_1.4s_infinite] rounded-full bg-white'
      />
      {children}
    </span>
  );
}
