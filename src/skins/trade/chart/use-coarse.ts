/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { useSyncExternalStore } from 'react';

const QUERY = '(pointer: coarse)';

const subscribe = (listener: () => void) => {
  const query = window.matchMedia(QUERY);
  query.addEventListener('change', listener);
  return () => query.removeEventListener('change', listener);
};

/** Whether the main pointer is a finger: the chart's own buttons then get a bigger strip. */
export function useCoarse(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}
