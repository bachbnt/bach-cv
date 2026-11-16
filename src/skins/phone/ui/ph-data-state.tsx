/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import type { ReactNode } from 'react';
import type { QueryLike } from '@/components/data-state';
import { LoadingBlock } from '@/components/loading-block';
import {
  statesCopy,
  type EmptyKey,
  type SubjectKey,
} from '@/content/copy/states';
import { useCopy } from '@/lib/i18n/copy';
import { PhButton, PhButtonLink } from '@/skins/phone/ui/ph-button';
import { PhStateNotice } from '@/skins/phone/ui/ph-state-notice';

/** Skeleton while loading (announced once), the error card with Try again, the empty card, or the content. Same words and rules as Standard. */
export function PhDataState({
  query,
  count,
  empty,
  emptyContent,
  subject,
  skeleton,
  level,
  className,
  skeletonClassName = className,
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
  /** the spacing of the skeleton when it is not the one of the states (the skeleton holds headings the loaded page lays out on its own) */
  skeletonClassName?: string;
  children: ReactNode;
}) {
  const copy = useCopy(statesCopy);

  if (query.isPending)
    return (
      <LoadingBlock className={skeletonClassName}>{skeleton}</LoadingBlock>
    );

  // a background refetch that failed keeps the data it had: only a block with nothing to show is an error
  if (query.isError && count === 0)
    return (
      <PhStateNotice
        kind='error'
        level={level}
        className={className}
        title={copy.error.title(copy.subjects[subject])}
        body={copy.error.body}
      >
        <PhButton variant='solid' onClick={() => void query.refetch()}>
          {copy.retry}
        </PhButton>
      </PhStateNotice>
    );

  if (count === 0) {
    if (emptyContent) return <>{emptyContent}</>;
    const { title, body, action } = copy.empty[empty];
    return (
      <PhStateNotice
        kind='empty'
        level={level}
        className={className}
        title={title}
        body={body}
      >
        {action && (
          <PhButtonLink variant='tonal' href={action.href}>
            {action.label}
          </PhButtonLink>
        )}
      </PhStateNotice>
    );
  }

  return <>{children}</>;
}
