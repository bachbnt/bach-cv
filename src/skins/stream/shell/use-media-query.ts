/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useSyncExternalStore } from 'react';

/** Whether a media query matches. The server and the first render say no, so what the visitor sees first is the narrow layout. */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (notify) => {
      const list = window.matchMedia(query);
      list.addEventListener('change', notify);
      return () => list.removeEventListener('change', notify);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
