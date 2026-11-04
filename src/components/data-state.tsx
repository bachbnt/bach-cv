/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { LoadingBlock } from '@/components/skeletons';
import { StateNotice } from '@/components/state-notice';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  statesCopy,
  type EmptyKey,
  type SubjectKey,
} from '@/content/copy/states';
import { useCopy } from '@/lib/i18n/copy';

/** What a block needs from a query: whether it is loading or failed, and how to try again. */
export interface QueryLike {
  isPending: boolean;
  isError: boolean;
  refetch: () => unknown;
}

/**
 * The three states of a block that reads data, the same on every page:
 * a skeleton while it loads, a card with Try again when it fails, a card when there is nothing to show,
 * and the real content (`children`) otherwise. `count` is how many items there are.
 */
export function DataState({
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

  if (query.isPending)
    return <LoadingBlock className={className}>{skeleton}</LoadingBlock>;

  if (query.isError)
    return (
      <StateNotice
        kind='error'
        level={level}
        className={className}
        title={copy.error.title(copy.subjects[subject])}
        body={copy.error.body}
      >
        <Button type='button' onClick={() => void query.refetch()}>
          {copy.retry}
        </Button>
      </StateNotice>
    );

  if (count === 0) {
    if (emptyContent) return <>{emptyContent}</>;
    const { title, body, action } = copy.empty[empty];
    return (
      <StateNotice
        kind='empty'
        level={level}
        className={className}
        title={title}
        body={body}
      >
        {action && (
          <Link href={action.href} className={buttonVariants()}>
            {action.label}
          </Link>
        )}
      </StateNotice>
    );
  }

  return <>{children}</>;
}
