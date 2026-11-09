/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useMemo, useSyncExternalStore } from 'react';

/** The subscribe and snapshot functions of one media query, for `useSyncExternalStore`. */
export function watchMedia(query: string) {
  return {
    subscribe: (listener: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener('change', listener);
      return () => list.removeEventListener('change', listener);
    },
    snapshot: () => window.matchMedia(query).matches,
  };
}

/** Whether a media query matches now and while the page is open. `serverValue` is what the static HTML and the first render assume. */
export function useMediaQuery(query: string, serverValue: boolean): boolean {
  const media = useMemo(() => watchMedia(query), [query]);
  return useSyncExternalStore(
    media.subscribe,
    media.snapshot,
    () => serverValue,
  );
}
