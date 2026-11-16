/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useSyncExternalStore } from 'react';

const subscribe = (notify: () => void) => {
  const timer = setInterval(notify, 15_000);
  return () => clearInterval(timer);
};
/** The current minute (as a number of minutes), `0` on the server: the clock is only drawn once the page is in the browser. */
const minute = () => Math.floor(Date.now() / 60_000);

/** The minute that the status bar shows, or `0` before the page has a clock (the server and the first render). */
export function useClockMinute(): number {
  return useSyncExternalStore(subscribe, minute, () => 0);
}
