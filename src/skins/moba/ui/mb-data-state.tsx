/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { mobaCopy } from '@/content/copy/moba';
import {
  statesCopy,
  type EmptyKey,
  type SubjectKey,
} from '@/content/copy/states';
import { useCopy } from '@/lib/i18n/copy';
import { mbButton, MbButton } from '@/skins/moba/ui/mb-button';
import { MbLoading } from '@/skins/moba/ui/mb-loading';
import { MbStateNotice } from '@/skins/moba/ui/mb-state-notice';

/** What a block needs from a query: whether it is loading or failed, and how to try again. */
export interface QueryLike {
  isPending: boolean;
  isError: boolean;
  refetch: () => unknown;
}

/**
 * The three states of a block that reads data, the same on every page and in the words of Standard: a loading screen while it loads,
 * a "connection lost" card with Try again when it fails, a card when there is nothing to show, and the real content otherwise.
 */
export function MbDataState({
  query,
  count,
  empty,
  subject,
  skeleton,
  emptyContent,
  level,
  className,
  children,
}: {
  query: QueryLike;
  count: number;
  empty: EmptyKey;
  subject: SubjectKey;
  /** replaces the loading screen, for a block whose shape is known */
  skeleton?: ReactNode;
  /** replaces the empty card, for a block with its own (the payment page's "paused" card) */
  emptyContent?: ReactNode;
  level?: 2 | 3;
  className?: string;
  children: ReactNode;
}) {
  const copy = useCopy(statesCopy);
  const mb = useCopy(mobaCopy).states;
  if (query.isPending)
    return (
      <div
        role='status'
        aria-busy='true'
        aria-label={copy.loading}
        className={className}
      >
        {skeleton ?? <MbLoading seed={subject.length} />}
      </div>
    );
  if (query.isError)
    return (
      <MbStateNotice
        kind='error'
        kicker={mb.errorKicker}
        level={level}
        className={className}
        title={copy.error.title(copy.subjects[subject])}
        body={copy.error.body}
      >
        <MbButton variant='gold' onClick={() => void query.refetch()}>
          {copy.retry}
        </MbButton>
      </MbStateNotice>
    );
  if (count === 0) {
    if (emptyContent) return <>{emptyContent}</>;
    const { title, body, action } = copy.empty[empty];
    return (
      <MbStateNotice
        kind='empty'
        kicker={mb.emptyKicker}
        level={level}
        className={className}
        title={title}
        body={body}
      >
        {action && (
          <Link href={action.href} className={mbButton({ variant: 'gold' })}>
            {action.label}
          </Link>
        )}
      </MbStateNotice>
    );
  }
  return <>{children}</>;
}
