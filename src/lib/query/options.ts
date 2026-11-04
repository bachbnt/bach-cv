/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { queryOptions } from '@tanstack/react-query';
import { contentRepository } from '@/lib/content/index';
import {
  resolveItems,
  type CollectionName,
  type Doc,
} from '@/lib/content/schema';
import { queryKeys } from './keys';

const FIVE_MINUTES = 5 * 60 * 1000;

/** The switches: the first read, and the one worth refreshing when a visitor comes back to the tab. */
export const liveQueryOptions = () =>
  queryOptions({
    queryKey: queryKeys.live,
    queryFn: () => contentRepository.loadLive(),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
  });

export const profileQueryOptions = () =>
  queryOptions({
    queryKey: queryKeys.profile,
    queryFn: () => contentRepository.loadProfile(),
    staleTime: FIVE_MINUTES,
  });

export const settingsQueryOptions = () =>
  queryOptions({
    queryKey: queryKeys.settings,
    queryFn: () => contentRepository.loadSettings(),
    staleTime: FIVE_MINUTES,
  });

/** Collections that read newest first by their own date, not by a hand-set `sort`. */
const DATE_OF: Partial<Record<CollectionName, (doc: never) => string>> = {
  // a role with no end comes first, then the latest end, then the latest start
  experience: (d: Doc<'experience'>) =>
    `${d.endMonth ?? '9999-12'} ${d.startMonth}`,
  education: (d: Doc<'education'>) =>
    `${d.endMonth ?? '9999-12'} ${d.startMonth}`,
  certificates: (d: Doc<'certificates'>) => d.issuedAt,
};

/**
 * Visible documents of one collection, already in display order.
 * Sorting happens here, in memory: the Firestore query has no `orderBy`, so it needs no composite index.
 */
export const contentQueryOptions = <N extends CollectionName>(
  name: N,
  options: { featuredFirst?: boolean } = {},
) =>
  queryOptions({
    queryKey: queryKeys.content(name),
    queryFn: () => contentRepository.list(name),
    staleTime: FIVE_MINUTES,
    select: (docs: Doc<N>[]): Doc<N>[] => {
      const dateOf = DATE_OF[name] as ((doc: Doc<N>) => string) | undefined;
      if (dateOf)
        return docs
          .filter((d) => d.visible)
          .sort((a, b) => dateOf(b).localeCompare(dateOf(a)));
      return resolveItems(
        docs as unknown as Parameters<typeof resolveItems>[0],
        options,
      ) as unknown as Doc<N>[];
    },
  });
