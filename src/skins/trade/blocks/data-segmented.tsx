/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** A few choices side by side, one pressed (a view, a density, an order). The group carries the label; each button is `aria-pressed`. */
export function DataSegmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string; icon?: ReactNode }[];
  onChange: (value: T) => void;
}) {
  return (
    <div
      role='group'
      aria-label={label}
      className='inline-flex rounded border border-tv-line p-px'
    >
      {options.map((option) => (
        <button
          key={option.value}
          type='button'
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'inline-flex h-[26px] cursor-pointer items-center gap-1.5 rounded-sm px-2.5 text-[13px] whitespace-nowrap text-tv-mute transition-colors hover:text-tv-ink active:text-tv-ink aria-pressed:bg-tv-hover aria-pressed:font-semibold aria-pressed:text-tv-ink pointer-coarse:min-h-11 pointer-coarse:px-3.5 [&_svg]:size-3.5',
          )}
        >
          {option.icon}
          {option.label}
        </button>
      ))}
    </div>
  );
}
