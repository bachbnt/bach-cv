/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ReactNode } from 'react';

/** Label above, the control, then the error text on the left and an optional counter on the right of one line. */
export function DeskField({
  id,
  label,
  error,
  aside,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className='flex flex-col gap-1'>
      <label htmlFor={id} className='text-xs font-medium text-tv-mute'>
        {label}
      </label>
      {children}
      <div className='flex justify-between gap-3 text-xs'>
        <span id={`${id}-error`} className='min-h-4 text-tv-down-ink'>
          {error}
        </span>
        {aside}
      </div>
    </div>
  );
}
