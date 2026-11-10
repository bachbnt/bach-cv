/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useInViewOnce } from '@/skins/trade/blocks/desk-use-in-view';
import { useCountUp } from '@/skins/trade/shell/use-count-up';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

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
  const [ref, seen] = useInViewOnce<HTMLSpanElement>();
  // with reduced motion there is nothing to wait for: the number is there before it is seen
  const reduced = useReducedMotion();
  const shown = useCountUp(seen || reduced ? value : null, 900);

  return (
    <span
      ref={ref}
      data-testid='desk-count'
      data-value={value}
      className={className}
    >
      <span aria-hidden='true'>{shown}</span>
      <span className='sr-only'>{value}</span>
    </span>
  );
}
