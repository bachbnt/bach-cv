/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Label above (handwritten), the control, then the error text and an optional counter below. */
export function ContactField({
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
    <span
      id={`${id}-error`}
      className='min-h-[20px] font-ac-note text-[16px] leading-[1.3] text-ac-accent'
    >
      {error}
    </span>
  );
  return (
    <div className={cn('flex flex-col gap-0.5', className)}>
      <label
        htmlFor={id}
        className='font-ac-note text-[20px]/[1.1] font-bold text-ac-ink'
      >
        {label}
      </label>
      {children}
      {aside ? (
        <div className='flex justify-between gap-3 font-ac-note text-[14px] text-ac-mute'>
          {errorLine}
          {aside}
        </div>
      ) : (
        errorLine
      )}
    </div>
  );
}
