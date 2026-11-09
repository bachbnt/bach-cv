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
import { AcButton, AcButtonLink } from '@/skins/academic/ui/ac-button';
import { AcStateNotice } from '@/skins/academic/ui/ac-state-notice';

/** Skeleton while loading (announced once), the error note with Try again, the empty note, or the content. Same words as Standard. */
export function AcDataState({
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
  /** replaces the empty note, for a block with its own (the payment page's "paused" note) */
  emptyContent?: ReactNode;
  subject: SubjectKey;
  skeleton: ReactNode;
  level?: 2 | 3;
  /** spacing around the skeleton and the notes, so the page does not jump when the data arrives */
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
      <AcStateNotice
        kind='error'
        level={level}
        className={className}
        title={copy.error.title(copy.subjects[subject])}
        body={copy.error.body}
      >
        <AcButton onClick={() => void query.refetch()}>{copy.retry}</AcButton>
      </AcStateNotice>
    );
  }

  if (count === 0) {
    if (emptyContent) return <>{emptyContent}</>;
    const { title, body, action } = copy.empty[empty];
    return (
      <AcStateNotice
        kind='empty'
        level={level}
        className={className}
        title={title}
        body={body}
      >
        {action && (
          <AcButtonLink variant='quiet' href={action.href}>
            {action.label}
          </AcButtonLink>
        )}
      </AcStateNotice>
    );
  }

  return <>{children}</>;
}
