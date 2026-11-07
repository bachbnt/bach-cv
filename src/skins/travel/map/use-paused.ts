/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useEffect, useState, type RefObject } from 'react';

/** True while the element is off screen or the tab is hidden: the map pauses its animations then (`.tl-paused`). */
export function usePaused(ref: RefObject<HTMLElement | null>): boolean {
  const [offScreen, setOffScreen] = useState(false);
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) =>
      setOffScreen(!entry.isIntersecting),
    );
    observer.observe(element);
    const onVisibility = () => setHidden(document.hidden);
    onVisibility();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [ref]);
  return offScreen || hidden;
}
