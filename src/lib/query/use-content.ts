/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  localize,
  type CollectionName,
  type Doc,
  type Lang,
  type Profile,
} from '@/lib/content/schema';
import { useLang } from '@/lib/i18n/language';
import { contentQueryOptions, profileQueryOptions } from './options';

type Translations = Partial<Record<Lang, Record<string, unknown>>>;

/** A collection in display order, with the visitor's language laid over each document (`l10n`). */
export function useContentQuery<N extends CollectionName>(
  name: N,
  options: { featuredFirst?: boolean } = {},
): UseQueryResult<Doc<N>[]> {
  const query = useQuery(contentQueryOptions(name, options));
  const { lang } = useLang();
  const data = useMemo(
    () =>
      query.data?.map((doc) =>
        // payments carry no translations
        'l10n' in doc
          ? (localize(doc as Doc<N> & { l10n: Translations }, lang) as Doc<N>)
          : doc,
      ),
    [query.data, lang],
  );
  return { ...query, data } as UseQueryResult<Doc<N>[]>;
}

/** `site/profile` in the visitor's language. */
export function useProfileQuery(): UseQueryResult<Profile> {
  const query = useQuery(profileQueryOptions());
  const { lang } = useLang();
  const data = useMemo(
    () => (query.data ? localize(query.data, lang) : undefined),
    [query.data, lang],
  );
  return { ...query, data } as UseQueryResult<Profile>;
}
