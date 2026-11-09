/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useEffect } from 'react';
import { isTyping } from '@/lib/is-typing';

/** Ctrl or Cmd with K, and "/" outside a field, open the symbol search. */
export function useSearchHotkey(open: () => void) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      // a part of the page that took the key already (the filter of the Screener takes "/") keeps it
      if (event.defaultPrevented) return;
      const chord =
        (event.ctrlKey || event.metaKey) &&
        !event.altKey &&
        event.key.toLowerCase() === 'k';
      const slash =
        event.key === '/' &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey &&
        !isTyping(event.target);
      if (!chord && !slash) return;
      event.preventDefault();
      open();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);
}
