/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useState, type ReactNode } from 'react';
import type { QueryLike } from '@/components/data-state';
import {
  statesCopy,
  type EmptyKey,
  type SubjectKey,
} from '@/content/copy/states';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import { useLoopGate } from '@/hooks/use-loop-gate';
import { TvButton, TvLink } from '@/skins/trade/ui/tv-button';
import { TvFadeIn } from '@/skins/trade/ui/tv-fade-in';
import { TvStateNotice } from '@/skins/trade/ui/tv-state-notice';

/** Skeleton while loading (announced once, with a thin line sweeping along its top), the error card with Try again, the empty card, or the content (which fades in over a skeleton). Same words as Standard. */
export function TvDataState({
  query,
  count,
  empty,
  emptyContent,
  subject,
  skeleton,
  level,
  className,
  children,
}: {
  query: QueryLike;
  count: number;
  empty: EmptyKey;
  /** replaces the empty card, for a block with its own (the payment page's "paused" card) */
  emptyContent?: ReactNode;
  subject: SubjectKey;
  skeleton: ReactNode;
  level?: 2 | 3;
  /** spacing around the skeleton and the cards, so the page does not jump when the data arrives */
  className?: string;
  children: ReactNode;
}) {
  const copy = useCopy(statesCopy);
  const gate = useLoopGate();
  // a block that showed its skeleton fades in over it; one that had its data from the start (the cache) just appears
  const [waited, setWaited] = useState(query.isPending);
  if (query.isPending && !waited) setWaited(true);

  if (query.isPending) {
    return (
      <div
        ref={gate}
        role='status'
        aria-busy='true'
        aria-label={copy.loading}
        className={cn('relative overflow-hidden', className)}
      >
        <span
          aria-hidden='true'
          className='absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden'
        >
          <span className='block h-full w-1/3 animate-[tv-load_1.2s_ease-in-out_infinite] bg-tv-accent' />
        </span>
        {skeleton}
      </div>
    );
  }

  if (query.isError) {
    return (
      <TvStateNotice
        kind='error'
        level={level}
        className={className}
        title={copy.error.title(copy.subjects[subject])}
        body={copy.error.body}
      >
        <TvButton variant='primary' onClick={() => void query.refetch()}>
          {copy.retry}
        </TvButton>
      </TvStateNotice>
    );
  }

  if (count === 0) {
    if (emptyContent) return <>{emptyContent}</>;
    const { title, body, action } = copy.empty[empty];
    return (
      <TvStateNotice
        kind='empty'
        level={level}
        className={className}
        title={title}
        body={body}
      >
        {action && (
          <TvLink variant='outline' href={action.href}>
            {action.label}
          </TvLink>
        )}
      </TvStateNotice>
    );
  }

  return waited ? <TvFadeIn>{children}</TvFadeIn> : <>{children}</>;
}
