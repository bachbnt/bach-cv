/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { cn } from 'cn';

const chip =
  'inline-flex min-h-11 items-center gap-1.5 rounded-full border-[1.5px] px-[18px] py-[9px] text-[15px] font-medium transition-[color,background-color,border-color,scale] active:scale-[.97] min-[721px]:min-h-0 pointer-coarse:min-h-11';

/**
 * One choice of a filter of the Projects page: a toggle with the number of projects it shows beside the name. The count is part of the
 * accessible name ("Mobile, 4"), a choice that would show nothing is dimmed but can still be picked or dropped.
 */
export function ProjectFilterChip({
  label,
  count,
  pressed,
  onClick,
}: {
  label: string;
  /** left out for "All" */
  count?: number;
  pressed: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type='button'
      aria-pressed={pressed}
      aria-label={count === undefined ? undefined : `${label}, ${count}`}
      onClick={onClick}
      className={cn(
        chip,
        pressed
          ? 'border-page bg-page text-background'
          : 'border-border bg-card hover:border-foreground active:border-foreground',
        !pressed && count === 0 && 'opacity-50',
      )}
    >
      {label}
      {count !== undefined && (
        <span
          aria-hidden='true'
          className={cn(
            'text-[13px] tabular-nums',
            pressed ? 'opacity-80' : 'text-muted-foreground',
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}
