/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { AlertTriangle, Inbox } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * The card shown in place of a block of data: nothing to show yet, or the connection was lost. One look for every page; `level` is the
 * heading level, so a card inside a section stays below that section's heading.
 */
export function MbStateNotice({
  kind,
  kicker,
  title,
  body,
  level = 2,
  className,
  children,
}: {
  kind: 'empty' | 'error';
  kicker: string;
  title: string;
  body: string;
  level?: 2 | 3;
  className?: string;
  children?: ReactNode;
}) {
  const Heading = `h${level}` as const;
  const Icon = kind === 'error' ? AlertTriangle : Inbox;
  return (
    <div
      role={kind === 'error' ? 'alert' : 'status'}
      data-state={kind}
      className={cn(
        'mb-card flex max-w-[640px] flex-col items-start gap-4 p-6 text-mb-ink max-[719px]:p-4',
        kind === 'error' && 'mb-notice-error',
        className,
      )}
    >
      <p className='flex items-center gap-2 text-[11px] leading-none font-bold tracking-[0.2em] uppercase'>
        <Icon
          aria-hidden='true'
          className={cn(
            'size-4',
            kind === 'error' ? 'text-mb-red-ink' : 'text-mb-gold-ink',
          )}
        />
        <span
          className={kind === 'error' ? 'text-mb-red-ink' : 'text-mb-gold-ink'}
        >
          {kicker}
        </span>
      </p>
      <div>
        <Heading className='mb-2 text-[28px] leading-tight text-mb-title'>
          {title}
        </Heading>
        <p className='text-[15px] leading-[1.6] text-mb-mute'>{body}</p>
      </div>
      {children}
    </div>
  );
}
