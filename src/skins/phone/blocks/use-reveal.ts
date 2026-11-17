/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useEffect, useState } from 'react';
import { usePhScreen } from '@/skins/phone/shell/screen-context';

/** Whether there is nothing to wait for: no way to see when it is on screen, or a visitor who asked for no motion. Then what arrives is already there. */
const showsAtOnce = () =>
  typeof window === 'undefined' ||
  !('IntersectionObserver' in window) ||
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Says when a widget has first been on screen: `played` is false until a third of it is in the visible area of the scroller of the screen (the
 * window on a phone), then true for good, so what arrives plays once for the page and never again while it is scrolled back. Without motion
 * or without an observer it is true from the first render, and the widget is in its final state.
 */
export function useReveal(): {
  ref: (node: HTMLElement | null) => void;
  played: boolean;
} {
  const { scroller } = usePhScreen();
  const [played, setPlayed] = useState(showsAtOnce);
  const [node, setNode] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (played || !node) return;
    // the screen has a scroller of its own in a device and a tablet layout; on a phone the window scrolls
    const root =
      scroller && getComputedStyle(scroller).overflowY === 'auto'
        ? scroller
        : null;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setPlayed(true);
        observer.disconnect();
      },
      { root, threshold: 0.3 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [played, node, scroller]);

  return { ref: setNode, played };
}
