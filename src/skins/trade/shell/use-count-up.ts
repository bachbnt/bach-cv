/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/skins/trade/shell/use-reduced-motion';

/** The number shown while it counts: ease-out from 0, so it slows as it arrives. */
export const countAt = (target: number, progress: number): number =>
  Math.round(target * (1 - (1 - Math.min(1, Math.max(0, progress))) ** 3));

/**
 * A number that counts up to `target` once, the first time it is known (`null` while it is not). With reduced motion it is the
 * target at once. The real number is always `target`: callers give it to assistive technology and show this one as decoration.
 */
export function useCountUp(target: number | null, duration = 1100): number {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(0);
  const played = useRef(false);

  useEffect(() => {
    if (target === null) return;
    if (reduced || played.current) {
      setShown(target);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const tick = (time: number) => {
      const progress = (time - start) / duration;
      setShown(countAt(target, progress));
      if (progress < 1) frame = requestAnimationFrame(tick);
      else played.current = true;
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, reduced, duration]);

  return reduced && target !== null ? target : shown;
}
