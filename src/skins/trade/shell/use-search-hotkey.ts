/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useEffect } from 'react';

/** Whether a key press belongs to a field the visitor is typing in (the search must not steal a "/" typed into the chat). */
const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

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
