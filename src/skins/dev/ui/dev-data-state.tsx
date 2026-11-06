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
import { DevStateNotice } from '@/skins/dev/ui/dev-state-notice';
import { DevButton, DevButtonLink } from '@/skins/dev/ui/dev-button';

/** Skeleton while loading (announced once), the error card with Try again, the empty card, or the content. Same words as Standard. */
export function DevDataState({
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
      <DevStateNotice
        kind='error'
        level={level}
        className={className}
        title={copy.error.title(copy.subjects[subject])}
        body={copy.error.body}
      >
        <DevButton variant='solid' onClick={() => void query.refetch()}>
          {copy.retry}
        </DevButton>
      </DevStateNotice>
    );
  }

  if (count === 0) {
    if (emptyContent) return <>{emptyContent}</>;
    const { title, body, action } = copy.empty[empty];
    return (
      <DevStateNotice
        kind='empty'
        level={level}
        className={className}
        title={title}
        body={body}
      >
        {action && (
          <DevButtonLink href={action.href}>{action.label}</DevButtonLink>
        )}
      </DevStateNotice>
    );
  }

  return <>{children}</>;
}
