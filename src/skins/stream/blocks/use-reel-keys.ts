/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useEffect } from 'react';

/** Whether the key press is for something that types or picks (a field, a menu), which keeps the arrow keys. */
const keepsKeys = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    target.closest(
      'input, textarea, select, [role="menu"], [role="listbox"], [role="log"]',
    ) !== null);

/**
 * ArrowDown shows the next project and ArrowUp the previous one, like a Shorts page. They are left alone while a field has the focus
 * or a window is open, and when there is only one project (the page then scrolls as usual).
 */
export function useReelKeys(step: (by: 1 | -1) => void, active: boolean) {
  useEffect(() => {
    if (!active) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)
        return;
      if (keepsKeys(event.target) || document.querySelector('[role="dialog"]'))
        return;
      event.preventDefault();
      step(event.key === 'ArrowDown' ? 1 : -1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [step, active]);
}
