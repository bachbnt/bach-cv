/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export function HeaderButton({
  label,
  sortLabel,
  state,
  onClick,
}: {
  label: string;
  sortLabel: string;
  state: 'ascending' | 'descending' | 'none';
  onClick: () => void;
}) {
  const Icon =
    state === 'ascending'
      ? ArrowUp
      : state === 'descending'
        ? ArrowDown
        : ChevronsUpDown;
  return (
    <button
      type='button'
      aria-label={sortLabel}
      onClick={onClick}
      className={cn(
        'inline-flex h-8 cursor-pointer items-center gap-1 rounded px-1 -ml-1 whitespace-nowrap transition-colors hover:text-tv-ink active:text-tv-ink pointer-coarse:min-h-11',
        state !== 'none' && 'font-semibold text-tv-ink',
      )}
    >
      {label}
      <Icon
        aria-hidden='true'
        className={cn('size-3', state === 'none' && 'opacity-40')}
      />
    </button>
  );
}
