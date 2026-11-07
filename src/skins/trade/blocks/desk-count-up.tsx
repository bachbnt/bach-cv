/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useEffect, useState } from 'react';
import { countAt } from '@/skins/trade/blocks/desk-facts';
import { useInViewOnce } from '@/skins/trade/blocks/desk-use-in-view';
import { useReducedMotion } from '@/skins/trade/shell/use-reduced-motion';

const DURATION_MS = 900;

/**
 * A real number that counts up from 0 the first time it is seen (once). With reduced motion it is shown at once. The animated digits are
 * hidden from assistive technology, which reads the final number.
 */
export function DeskCountUp({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const [ref, seen] = useInViewOnce<HTMLSpanElement>();
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!seen || reduced) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      setShown(countAt(value, (now - start) / DURATION_MS));
      if (now - start < DURATION_MS) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [seen, reduced, value]);

  return (
    <span
      ref={ref}
      data-testid='desk-count'
      data-value={value}
      className={className}
    >
      <span aria-hidden='true'>{reduced ? value : shown}</span>
      <span className='sr-only'>{value}</span>
    </span>
  );
}
