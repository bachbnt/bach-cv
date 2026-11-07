/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import type { CollectionName, Doc } from '@/lib/content/schema';
import { contentQueryOptions } from '@/lib/query/options';

/**
 * A collection that is already in the query cache, or `undefined`. It never reads Firestore: the watchlist is on every page and must
 * not make a page pay for documents it does not show, so its counts and its list of technologies wait for a page that read them.
 */
export function useCachedContent<N extends CollectionName>(
  name: N,
): Doc<N>[] | undefined {
  return useQuery({ ...contentQueryOptions(name), enabled: false }).data;
}
