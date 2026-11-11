/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { liveSchema, type Live } from '@/lib/content/schema';

/** localStorage key of the last `site/live` `prefs` that this browser read, so the head script and the first render of a visitor who comes back
 *  already know what the owner said (a first visit has to wait for the read, and may see the default for a moment). */
export const PREFS_CACHE_KEY = 'bach-cv-prefs';

/** What the owner has said about the skin, the theme and the language. */
export type RemotePrefs = Live['prefs'];

/** Nothing said: no default, no force, nothing left out. */
export const EMPTY_PREFS: RemotePrefs = liveSchema.shape.prefs.parse({});

/** The cached prefs, or nothing said if there are none or they cannot be read. Storage may be blocked. */
export function readCachedPrefs(): RemotePrefs {
  try {
    const raw = window.localStorage.getItem(PREFS_CACHE_KEY);
    if (raw) return liveSchema.shape.prefs.parse(JSON.parse(raw));
  } catch {
    // blocked, or not what it should be
  }
  return EMPTY_PREFS;
}

/** Keeps `prefs` for the head script and the next visit; it does nothing if they are what is kept. */
export function writeCachedPrefs(prefs: RemotePrefs): void {
  try {
    const next = JSON.stringify(prefs);
    if (window.localStorage.getItem(PREFS_CACHE_KEY) !== next)
      window.localStorage.setItem(PREFS_CACHE_KEY, next);
  } catch {
    // storage blocked: the next visit reads them again
  }
}
