/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const filterVariants = cva(
  "cursor-pointer rounded-[4px] border px-3.5 py-[7px] font-code text-[13px] leading-[normal] font-normal before:content-['--'_/_''] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal active:[transform:scale(0.97)]",
  {
    variants: {
      on: {
        true: 'border-signal bg-signal text-editor',
        false: 'border-line-2 bg-chrome text-mute hover:text-head',
      },
    },
  },
);

/**
 * A row of toggle chips that filters a list by kind (`--All`, `--Bank`): one is pressed. The dashes are decoration (the CSS
 * `content` has an empty alternative text), so a button is named by its label alone.
 */
export function DevFilterGroup<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div
      role='group'
      aria-label={label}
      className='mt-1 mb-[18px] flex flex-wrap gap-2'
      data-reveal
    >
      {options.map((option) => (
        <button
          key={option.value}
          type='button'
          data-slot='dev-filter'
          className={cn(filterVariants({ on: value === option.value }))}
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
