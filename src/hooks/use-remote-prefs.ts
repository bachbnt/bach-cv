/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { liveQueryOptions } from '@/lib/query/options';
import {
  EMPTY_PREFS,
  readCachedPrefs,
  writeCachedPrefs,
  type RemotePrefs,
} from '@/lib/preference/remote';

/**
 * What the owner has said (`site/live` `prefs`) about the skin, the theme and the language, and whether it has been read yet (`known`: only then
 * may a link's `?skin=`, `?theme=` or `?lang=` be kept as the visitor's choice, since a force would have to be undone). Until it has been read the
 * browser's copy of the last read is used, and a first visit has none: nothing is forced and nothing is left out, which is also what shows if it cannot be read. The
 * first render says nothing, so that it agrees with the static HTML; the copy is read right after hydration.
 */
export function useRemotePrefs(): { prefs: RemotePrefs; known: boolean } {
  const { data, isFetched } = useQuery(liveQueryOptions());
  const [cached, setCached] = useState<RemotePrefs>(EMPTY_PREFS);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading the saved copy must wait for the browser
    setCached(readCachedPrefs());
  }, []);
  useEffect(() => {
    if (data) writeCachedPrefs(data.prefs);
  }, [data]);
  return { prefs: data?.prefs ?? cached, known: isFetched };
}
