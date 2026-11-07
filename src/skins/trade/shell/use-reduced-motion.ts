/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { useSyncExternalStore } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

const subscribe = (listener: () => void) => {
  const query = window.matchMedia(QUERY);
  query.addEventListener('change', listener);
  return () => query.removeEventListener('change', listener);
};

/** Whether the visitor asked for less motion. The script of the skin that moves things (the market tick) checks it, because CSS cannot stop a timer. */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}
