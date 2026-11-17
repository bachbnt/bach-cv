/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useEffect, useState } from 'react';
import {
  BASE_DELAY,
  COUNT_MS,
  countAt,
} from '@/skins/phone/blocks/reveal-schedule';

/**
 * The number to show while a count goes up to `target` once `play` is true (from 0, over `COUNT_MS`, after the same wait as the rest of
 * the widget). If it is already playing at the first render (no motion, no observer) it is `target` at once.
 */
export function useCountUp(target: number, play: boolean): number {
  const [shown, setShown] = useState(play ? target : 0);
  const [finished, setFinished] = useState(play);

  useEffect(() => {
    if (!play || finished) return;
    let frame = 0;
    const start = performance.now() + BASE_DELAY;
    const tick = (now: number) => {
      const progress = (now - start) / COUNT_MS;
      if (progress >= 1) {
        setFinished(true);
        return;
      }
      setShown(countAt(target, progress));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [play, finished, target]);

  return finished ? target : shown;
}
