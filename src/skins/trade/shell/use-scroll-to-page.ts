/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useEffect, useRef, type RefObject } from 'react';
import type { PageKey } from '@/lib/content/schema';

/**
 * On a phone the page is below the chart and the document scrolls, and a page change keeps the old offset: from the bottom of Resume, the
 * About page would open halfway down. When the page is not the same one any more and its top is above the toolbar (which sticks to the
 * top of the screen), bring that top to just under the toolbar. A visitor who is still above it (at the chart) stays where they are.
 * `enabled` is false on the wide terminal, where the page has a panel of its own.
 */
export function useScrollToPage(
  panel: RefObject<HTMLElement | null>,
  page: PageKey | null,
  enabled: boolean,
) {
  const shown = useRef(page);
  useEffect(() => {
    if (shown.current === page) return;
    shown.current = page;
    if (!enabled) return;
    const top = panel.current?.getBoundingClientRect().top ?? 0;
    const toolbar = document.querySelector('[data-tv-toolbar]');
    const covered = toolbar?.getBoundingClientRect().bottom ?? 0;
    if (top < covered) window.scrollTo({ top: window.scrollY + top - covered });
  }, [panel, page, enabled]);
}
