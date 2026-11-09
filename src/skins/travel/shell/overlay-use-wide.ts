/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { useSyncExternalStore } from 'react';

/** The width where the page card floats over the map and the rail stands at the left (`md` of Tailwind); below it the chat is a sheet. */
const QUERY = '(min-width: 768px)';

const subscribe = (listener: () => void) => {
  const query = window.matchMedia(QUERY);
  query.addEventListener('change', listener);
  return () => query.removeEventListener('change', listener);
};

/** Whether the screen is wide enough for the chat to sit as a card over the map instead of a bottom sheet. */
export function useWide(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => true,
  );
}
