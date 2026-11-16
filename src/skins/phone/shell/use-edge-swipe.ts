/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useEffect } from 'react';
import { useLatest } from '@/hooks/use-latest';
import { isBackSwipe, startsAtEdge } from '@/skins/phone/shell/gestures';

/**
 * A swipe to the right that starts at the left edge of the screen, on a touch screen, goes back. Touch events are used because the browser
 * cancels the pointer events of a gesture it takes for a pan. `onBack` is `null` where there is nowhere to go (the home screen). It is
 * never the only way back: the app bar has a button.
 */
export function useEdgeSwipe(
  screen: HTMLElement | null,
  onBack: (() => void) | null,
) {
  const latest = useLatest(onBack);
  useEffect(() => {
    if (!screen) return;
    let from: { x: number; y: number } | null = null;
    const down = (event: TouchEvent) => {
      const touch = event.touches[0];
      from =
        touch &&
        startsAtEdge(touch.clientX, screen.getBoundingClientRect().left)
          ? { x: touch.clientX, y: touch.clientY }
          : null;
    };
    const up = (event: TouchEvent) => {
      const touch = event.changedTouches[0];
      if (
        from &&
        touch &&
        isBackSwipe(touch.clientX - from.x, touch.clientY - from.y)
      )
        latest.current?.();
      from = null;
    };
    const cancel = () => {
      from = null;
    };
    screen.addEventListener('touchstart', down, { passive: true });
    screen.addEventListener('touchend', up, { passive: true });
    screen.addEventListener('touchcancel', cancel, { passive: true });
    return () => {
      screen.removeEventListener('touchstart', down);
      screen.removeEventListener('touchend', up);
      screen.removeEventListener('touchcancel', cancel);
    };
  }, [screen, latest]);
}
