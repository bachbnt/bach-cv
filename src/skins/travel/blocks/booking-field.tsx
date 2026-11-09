/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** The look of a text box or message area of the booking form: a clear edge (3:1 on the panel), a coral ring on focus, red when it has an error. */
export const BOOKING_CONTROL =
  'w-full rounded-xl border border-[color-mix(in_srgb,var(--tl-muted)_75%,transparent)] bg-tl-solid px-3 py-2.5 text-[14px] leading-[1.4] text-tl-ink placeholder:text-tl-muted focus-visible:border-tl-coral focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-tl-coral aria-[invalid=true]:border-tl-danger';

/** Label above, the control, then the error line (always the same height) and an optional counter. The error is linked by `aria-describedby` on the control (`<id>-error`). */
export function BookingField({
  id,
  label,
  error,
  aside,
  className,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  aside?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <label htmlFor={id} className='text-[12.5px] font-bold'>
        {label}
      </label>
      {children}
      <div className='flex justify-between gap-3 text-[12px]'>
        <span
          id={`${id}-error`}
          className='min-h-[17px] font-semibold text-tl-danger'
        >
          {error}
        </span>
        {aside}
      </div>
    </div>
  );
}
