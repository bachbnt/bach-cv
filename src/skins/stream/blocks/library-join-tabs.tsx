/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { startTransition } from 'react';
import { paymentCopy } from '@/content/copy/payment';
import { useCopy } from '@/lib/i18n/copy';
import {
  countOfKind,
  type KindFilter,
  type PayKind,
} from '@/skins/stream/blocks/library-model';

/**
 * The bank / wallet filter drawn as the tabs of a channel page (an underline marks the open one). They are toggle buttons
 * (`aria-pressed`), as Standard's filter is, because they filter one list and do not swap panels.
 */
export function LibraryJoinTabs({
  kinds,
  rest,
  filter,
  onFilter,
}: {
  kinds: PayKind[];
  rest: { kind: PayKind }[];
  filter: KindFilter;
  onFilter: (filter: KindFilter) => void;
}) {
  const copy = useCopy(paymentCopy);
  return (
    <div
      role='group'
      aria-label={copy.filterLabel}
      className='mb-4 flex gap-1 border-b border-sm-line'
    >
      {(['all', ...kinds] as const).map((k) => (
        <button
          key={k}
          type='button'
          aria-pressed={filter === k}
          onClick={() => startTransition(() => onFilter(k))}
          className="relative h-11 cursor-pointer px-4 text-sm font-medium text-sm-mute transition-colors after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:rounded-full after:bg-transparent after:content-[''] hover:text-sm-ink aria-pressed:text-sm-ink aria-pressed:after:bg-sm-ink"
        >
          {k === 'all' ? copy.filterAll : copy.kinds[k]}
          <span className='ml-1.5 tabular-nums opacity-70'>
            {countOfKind(rest, k)}
          </span>
        </button>
      ))}
    </div>
  );
}
