/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { useSyncExternalStore } from 'react';

const subscribe = (listener: () => void) => {
  window.addEventListener('resize', listener);
  return () => window.removeEventListener('resize', listener);
};

/** The height of the window, kept up to date (the splitter keeps its share of it, so a resize leaves a valid size). */
export function useViewportHeight(): number {
  return useSyncExternalStore(
    subscribe,
    () => window.innerHeight,
    () => 900,
  );
}
