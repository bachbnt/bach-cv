/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** The class of a text control of the order desk: sunk, square, 16px so a phone does not zoom in, red when its value is wrong. */
export const FIELD_CLASS =
  'mb-field block min-h-11 w-full rounded-[3px] border border-mb-line bg-mb-well px-3.5 py-2.5 text-[16px] leading-[1.4] text-mb-ink placeholder:text-mb-dim focus-visible:border-mb-teal-ink aria-invalid:border-mb-red';

/** Label above, the control, then the error (and a counter beside it). The error is read with the control through `aria-describedby`. */
export function ServicesField({
  id,
  label,
  error,
  aside,
  warn,
  className,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  aside?: ReactNode;
  /** the aside turns red (the counter near its limit) */
  warn?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-1.5', className)}>
      <label
        htmlFor={id}
        className='text-[11px] font-bold tracking-[0.16em] text-mb-gold-ink uppercase'
      >
        {label}
      </label>
      {children}
      <div className='flex justify-between gap-3 text-[13px]'>
        <span
          id={`${id}-error`}
          className='min-h-[18px] font-semibold text-mb-red-ink'
        >
          {error}
        </span>
        {aside && (
          <span
            className={cn(
              'flex-none tabular-nums',
              warn ? 'font-bold text-mb-red-ink' : 'text-mb-mute',
            )}
          >
            {aside}
          </span>
        )}
      </div>
    </div>
  );
}
