/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useEffect } from 'react';
import { useLatest } from '@/hooks/use-latest';
import { isTyping } from '@/lib/is-typing';

/**
 * The `F` key folds and unfolds the device. It stays out of the way of a field the visitor is typing in, of a dialog that is open (the
 * quick settings, the chat), and of every shortcut with a modifier. `enabled` is false where there is no device.
 */
export function useFoldKey(enabled: boolean, onToggle: () => void) {
  const latest = useLatest(onToggle);
  useEffect(() => {
    if (!enabled) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'f' && event.key !== 'F') return;
      if (event.ctrlKey || event.metaKey || event.altKey || event.repeat)
        return;
      if (event.defaultPrevented || isTyping(event.target)) return;
      if (document.querySelector('[role="dialog"][data-open]')) return;
      event.preventDefault();
      latest.current();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [enabled, latest]);
}
