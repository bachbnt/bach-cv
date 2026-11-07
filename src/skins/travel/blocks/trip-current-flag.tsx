/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { cn } from '@/lib/utils';

/** The coral "Current" mark of Standard's Current badge, with the pulsing dot of the trip (the word comes from the page's copy). */
export function TripCurrentFlag({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full bg-tl-coral px-2 py-0.5 text-[10px] font-extrabold text-tl-on-coral',
        className,
      )}
    >
      <i
        aria-hidden='true'
        className='tl-live size-1.5 rounded-full bg-tl-on-coral'
      />
      {children}
    </span>
  );
}
