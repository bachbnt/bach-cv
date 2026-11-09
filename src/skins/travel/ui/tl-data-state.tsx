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
import { travelShellCopy } from '@/content/copy/travel-shell';
import { useCopy } from '@/lib/i18n/copy';
import { TlButton, TlButtonLink } from '@/skins/travel/ui/tl-button';
import { TlStateNotice } from '@/skins/travel/ui/tl-state-notice';

/** Skeleton while loading (announced once), the error card with Try again, the empty card, or the content. Same words as Standard. */
export function TlDataState({
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
  emptyContent?: ReactNode;
  subject: SubjectKey;
  skeleton: ReactNode;
  level?: 2 | 3;
  className?: string;
  children: ReactNode;
}) {
  const copy = useCopy(statesCopy);
  const trip = useCopy(travelShellCopy).states;

  if (query.isPending)
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

  if (query.isError)
    return (
      <TlStateNotice
        kind='error'
        level={level}
        className={className}
        kicker={trip.error}
        title={copy.error.title(copy.subjects[subject])}
        body={copy.error.body}
      >
        <TlButton variant='solid' onClick={() => void query.refetch()}>
          {copy.retry}
        </TlButton>
      </TlStateNotice>
    );

  if (count === 0) {
    if (emptyContent) return <>{emptyContent}</>;
    const { title, body, action } = copy.empty[empty];
    return (
      <TlStateNotice
        kind='empty'
        level={level}
        className={className}
        kicker={trip.empty}
        title={title}
        body={body}
      >
        {action && (
          <TlButtonLink href={action.href}>{action.label}</TlButtonLink>
        )}
      </TlStateNotice>
    );
  }

  return <>{children}</>;
}
