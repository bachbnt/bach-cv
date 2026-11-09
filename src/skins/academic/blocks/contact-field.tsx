/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** The class of a line on paper that you write on: no box, a pen line under it (red when there is a problem). */
export const lineInput =
  'h-auto min-h-9 rounded-none border-0 border-b-2 border-ac-link bg-transparent px-0.5 py-1 font-ac-note text-[19px]/[1.4] text-ac-ink shadow-none outline-none dark:bg-transparent focus-visible:border-ac-accent focus-visible:ring-0 aria-invalid:border-ac-accent aria-invalid:ring-0 placeholder:text-ac-mute';

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
      className='min-h-[20px] text-[15px] leading-[1.3] text-ac-accent'
    >
      {error}
    </span>
  );
  return (
    <div className={cn('flex flex-col gap-0.5', className)}>
      <label
        htmlFor={id}
        className='font-ac-hand text-[23px]/[1.1] font-bold text-ac-ink'
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
