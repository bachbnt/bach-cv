/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useEffect, useState, type RefObject } from 'react';

/** Whether the element is on screen right now (a phone stacks the chart above the page, so it scrolls out of view). It starts as `true`. */
export function useOnScreen(ref: RefObject<Element | null>): boolean {
  const [onScreen, setOnScreen] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) =>
      setOnScreen(entry.isIntersecting),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return onScreen;
}
