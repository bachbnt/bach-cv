/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useSyncExternalStore } from 'react';

let current: { key: number; date: Date } | null = null;

/**
 * The current time, the same `Date` object for the whole month it was read in: every number that counts months or years (years in
 * software, the tenure of a role, the series of the chart) is month based, so every block of every skin must agree on one `now`. It
 * follows the clock of the page (a test that fakes the clock gets the faked time) and moves to a new object when the month changes.
 */
export function stableNow(): Date {
  const date = new Date();
  const key = date.getFullYear() * 12 + date.getMonth();
  if (current?.key !== key) current = { key, date };
  return current.date;
}

const subscribe = () => () => {};

/** `stableNow()` for a component: a stable reference, so it is safe in the dependencies of a memo or an effect. */
export function useNow(): Date {
  return useSyncExternalStore(subscribe, stableNow, stableNow);
}
