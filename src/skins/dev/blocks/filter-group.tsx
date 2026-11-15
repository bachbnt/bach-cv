/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { cva } from 'class-variance-authority';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

const filterVariants = cva(
  "cursor-pointer rounded-[4px] border px-3.5 py-[7px] font-code text-[13px] leading-[normal] font-normal before:content-['--'_/_''] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal active:[transform:scale(0.97)] pointer-coarse:min-h-11",
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
 * A row of toggle chips that filters a list (`--All`, `--Bank`): `value` is the one that is pressed, or `selected` are all that are (a filter
 * that takes several). The dashes are decoration (the CSS `content` has an empty alternative text), so a button is named by its label alone,
 * and by its label and its count ("Mobile, 4") when it has one. `caption` is the word that starts the row (`// Platform`), also decoration:
 * the row is named by `label`. `bare` leaves out the margins, for a row inside a toolbar.
 */
export function DevFilterGroup<T extends string>({
  label,
  caption,
  value,
  selected,
  options,
  onChange,
  bare = false,
  children,
}: {
  label: string;
  caption?: string;
  value?: T;
  selected?: readonly T[];
  options: readonly { value: T; label: string; count?: number }[];
  onChange: (value: T) => void;
  bare?: boolean;
  /** what ends the row, inside the group (a "More" button) */
  children?: ReactNode;
}) {
  const isOn = (v: T) => (selected ? selected.includes(v) : value === v);
  return (
    <div
      role='group'
      aria-label={label}
      className={cn(
        'flex flex-wrap items-center gap-2',
        !bare && 'mt-1 mb-[18px]',
      )}
      data-reveal={bare ? undefined : true}
    >
      {caption && (
        <span
          aria-hidden='true'
          className="min-w-[88px] font-code text-[12.5px] text-dim before:content-['//_']"
        >
          {caption}
        </span>
      )}
      {options.map((option) => (
        <button
          key={option.value}
          type='button'
          data-slot='dev-filter'
          className={cn(
            filterVariants({ on: isOn(option.value) }),
            !isOn(option.value) && option.count === 0 && 'opacity-50',
          )}
          aria-pressed={isOn(option.value)}
          aria-label={
            option.count === undefined
              ? undefined
              : `${option.label}, ${option.count}`
          }
          onClick={() => onChange(option.value)}
        >
          {option.label}
          {option.count !== undefined && (
            <span aria-hidden='true' className='ml-2 opacity-70'>
              {option.count}
            </span>
          )}
        </button>
      ))}
      {children}
    </div>
  );
}
