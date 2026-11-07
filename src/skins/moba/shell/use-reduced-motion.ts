/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useSyncExternalStore } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

const subscribe = (listener: () => void) => {
  const list = window.matchMedia(QUERY);
  list.addEventListener('change', listener);
  return () => list.removeEventListener('change', listener);
};

/** Whether the visitor asked for less motion. The server (and the first render) say no, so the markup matches. */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}
