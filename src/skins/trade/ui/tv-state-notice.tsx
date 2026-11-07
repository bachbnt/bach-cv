/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Inbox, TriangleAlert } from 'lucide-react';
import { cva } from 'class-variance-authority';
import { tradeDeskCopy } from '@/content/copy/trade-desk';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';

const noticeVariants = cva(
  'flex max-w-[640px] gap-3 rounded border bg-tv-panel px-4 py-3.5',
  {
    variants: {
      kind: {
        empty: 'border-dashed border-tv-line',
        error: 'border-tv-line border-l-2 border-l-tv-down',
      },
    },
  },
);

/**
 * Why there is nothing to show: `empty` ("No data for this symbol", with a way forward) or `error` (the widget error, with a retry). Same roles
 * and words as the Standard StateNotice; the small line above the title is the skin's own and is hidden from assistive technology.
 */
export function TvStateNotice({
  kind,
  title,
  body,
  level = 2,
  icon,
  className,
  children,
}: {
  kind: 'empty' | 'error';
  title: string;
  body: string;
  level?: 2 | 3;
  /** replaces the default mark of the kind */
  icon?: LucideIcon;
  className?: string;
  children?: ReactNode;
}) {
  const states = useCopy(tradeDeskCopy).states;
  const Heading = `h${level}` as const;
  const Icon = icon ?? (kind === 'error' ? TriangleAlert : Inbox);
  return (
    <div
      role={kind === 'error' ? 'alert' : 'status'}
      data-state={kind}
      className={cn(noticeVariants({ kind }), className)}
    >
      <span
        aria-hidden='true'
        className={cn(
          'grid size-10 flex-none place-items-center rounded-full',
          kind === 'error'
            ? 'bg-tv-down-bg text-tv-down'
            : 'bg-tv-hover text-tv-mute',
        )}
      >
        <Icon className='size-5' strokeWidth={1.8} />
      </span>
      <div className='min-w-0'>
        <p
          aria-hidden='true'
          className='mb-0.5 text-[10px] font-bold tracking-wider text-tv-dim uppercase'
        >
          {kind === 'error' ? states.errorKicker : states.emptyKicker}
        </p>
        <Heading className='mb-1 text-[15px] leading-snug font-bold'>
          {title}
        </Heading>
        <p className='text-[13px]/[1.5] text-tv-mute'>{body}</p>
        {children && (
          <div className='mt-3 flex flex-wrap gap-2'>{children}</div>
        )}
      </div>
    </div>
  );
}
