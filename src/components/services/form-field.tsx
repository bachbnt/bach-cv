/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ReactNode } from 'react';

/** Label above, control in the middle, the error text (and an optional counter) below. */
export function FormField({
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
  const errorLine = (
    <span id={`${id}-error`} className='min-h-[18px] text-[13.5px] text-danger'>
      {error}
    </span>
  );
  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ''}`}>
      <label htmlFor={id} className='text-sm font-semibold'>
        {label}
      </label>
      {children}
      {aside ? (
        <div className='flex justify-between gap-3 text-[13px] text-muted-foreground'>
          {errorLine}
          {aside}
        </div>
      ) : (
        errorLine
      )}
    </div>
  );
}
