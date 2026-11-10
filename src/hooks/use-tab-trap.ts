/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useEffect } from 'react';

const TABBABLE =
  'a[href],button:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"]),[contenteditable="true"]';

const isShown = (element: HTMLElement) => element.getClientRects().length > 0;

/** The dialog on top, if one is open: Base UI marks the popup `role="dialog"` and `data-open` (not while it closes). */
const topDialog = () => {
  const open = document.querySelectorAll<HTMLElement>(
    '[role="dialog"][data-open]',
  );
  return open.item(open.length - 1);
};

/**
 * Tab goes round inside the dialog that is open. Base UI lets focus leave a dialog through its focus guards (so a visitor can reach the
 * browser's own bar), and for a moment it can land on the page behind: the logo link, a menu. Here Tab on the last control goes to the
 * first and Shift+Tab on the first to the last, so it never leaves. Focus in a menu or a popover that opened from the dialog is left alone.
 * Every `Dialog` and `Sheet` calls this; the listener is one for the document and does nothing while no dialog is open.
 */
export function useTabTrap() {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || event.defaultPrevented) return;
      const popup = topDialog();
      if (!popup) return;
      const items = Array.from(
        popup.querySelectorAll<HTMLElement>(TABBABLE),
      ).filter(isShown);
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;
      const active = document.activeElement;
      const lost =
        active === null ||
        active === document.body ||
        active.hasAttribute('data-base-ui-focus-guard');
      const wrap = (target: HTMLElement) => {
        event.preventDefault();
        target.focus();
      };
      if (lost) return wrap(event.shiftKey ? last : first);
      if (!popup.contains(active)) return;
      if (event.shiftKey) {
        if (active === first || active === popup) wrap(last);
      } else if (active === last) wrap(first);
    };
    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, []);
}
