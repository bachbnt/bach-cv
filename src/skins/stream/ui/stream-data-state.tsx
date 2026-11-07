/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import type { ReactNode } from 'react';
import type { QueryLike } from '@/components/data-state';
import {
  statesCopy,
  type EmptyKey,
  type SubjectKey,
} from '@/content/copy/states';
import { useCopy } from '@/lib/i18n/copy';
import {
  StreamButton,
  StreamButtonLink,
} from '@/skins/stream/ui/stream-button';
import { StreamStateNotice } from '@/skins/stream/ui/stream-state-notice';

/** Skeleton while loading (announced once), the error panel with Try again, the empty panel, or the content. Same words as Standard. */
export function StreamDataState({
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

  if (query.isPending) {
    return (
      <div
        role='status'
        aria-busy='true'
        aria-label={copy.loading}
        className={className}
      >
        {skeleton}
      </div>
    );
  }

  if (query.isError) {
    return (
      <StreamStateNotice
        kind='error'
        level={level}
        className={className}
        title={copy.error.title(copy.subjects[subject])}
        body={copy.error.body}
      >
        <StreamButton variant='blue' onClick={() => void query.refetch()}>
          {copy.retry}
        </StreamButton>
      </StreamStateNotice>
    );
  }

  if (count === 0) {
    if (emptyContent) return <>{emptyContent}</>;
    const { title, body, action } = copy.empty[empty];
    return (
      <StreamStateNotice
        kind='empty'
        level={level}
        className={className}
        title={title}
        body={body}
      >
        {action && (
          <StreamButtonLink variant='blue' href={action.href}>
            {action.label}
          </StreamButtonLink>
        )}
      </StreamStateNotice>
    );
  }

  return <>{children}</>;
}
