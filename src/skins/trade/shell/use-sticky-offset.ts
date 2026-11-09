/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useEffect } from 'react';

/**
 * On a phone the toolbar sticks to the top of the screen (two rows, and more when it wraps). It writes its height to `--tv-sticky` on the
 * root, and `trade.css` turns that into `scroll-padding-top`, so everything that scrolls to a part of the page (a flag of the chart
 * opening a job or the education, a jump link) stops under the toolbar instead of behind it.
 */
export function useStickyOffset() {
  useEffect(() => {
    const toolbar = document.querySelector('[data-tv-toolbar]');
    const root = document.documentElement;
    if (!toolbar || typeof ResizeObserver === 'undefined') return;
    const write = () =>
      root.style.setProperty(
        '--tv-sticky',
        `${Math.round(toolbar.getBoundingClientRect().height)}px`,
      );
    write();
    const observer = new ResizeObserver(write);
    observer.observe(toolbar);
    return () => {
      observer.disconnect();
      root.style.removeProperty('--tv-sticky');
    };
  }, []);
}
