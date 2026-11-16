/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { Lang } from '@/lib/content/schema';

// What the screens for an error use. They run when something of the app has already failed, so nothing here may throw: every read and write
// of the browser is in try/catch, and nothing here imports a provider or a hook.

/** The key of the content the browser keeps (`components/providers.tsx`). */
export const QUERY_CACHE_KEY = 'bach-cv-query';
const LANG_KEY = 'bach-cv-lang';

type Store = Pick<Storage, 'getItem' | 'removeItem'>;

/** Forgets the content kept by the browser: the usual cause of an error that comes back is a copy that a newer version cannot read. */
export function clearQueryCache(store?: Store): boolean {
  try {
    (store ?? window.localStorage).removeItem(QUERY_CACHE_KEY);
    return true;
  } catch {
    return false;
  }
}

/** The language of the visitor, English if it cannot be read. */
export function savedLang(store?: Store): Lang {
  try {
    return (store ?? window.localStorage).getItem(LANG_KEY) === 'vi'
      ? 'vi'
      : 'en';
  } catch {
    return 'en';
  }
}

/** "Try again" of every error screen: forget the kept content, then load the page again. */
export function recover(): void {
  clearQueryCache();
  try {
    window.location.reload();
  } catch {
    // nothing else to do: the visitor can still reload by hand
  }
}
