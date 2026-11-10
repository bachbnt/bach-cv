/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useCallback } from 'react';

/** The one observer of every looping decoration: a page of services or skeletons has dozens, so each does not get its own. */
let observer: IntersectionObserver | null = null;

function shared(): IntersectionObserver | null {
  if (typeof IntersectionObserver === 'undefined') return null;
  observer ??= new IntersectionObserver((entries) => {
    for (const entry of entries)
      entry.target.toggleAttribute('data-off', !entry.isIntersecting);
  });
  return observer;
}

/**
 * A ref for the root of an endless loop (a skeleton, the drawing of a service, a live dot, a marquee): while the element is scrolled out of
 * view it carries `data-off`, and the CSS of the skin (`trade.css`, `dev-extra.css`) pauses every animation in and under it, so nothing runs
 * for nobody. The loops of a tab in the background are paused the same way by `data-hidden` on the root of the skin (`useDocumentHidden`).
 * Nothing changes for the layout.
 */
export function useLoopGate() {
  return useCallback((element: Element | null) => {
    const watcher = shared();
    if (!element || !watcher) return;
    watcher.observe(element);
    return () => {
      watcher.unobserve(element);
      element.removeAttribute('data-off');
    };
  }, []);
}
