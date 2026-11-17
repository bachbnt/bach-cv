/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { delayStyle } from '@/skins/phone/blocks/css-vars';
import { arcDelays } from '@/skins/phone/blocks/reveal-schedule';
import { RING_RADIUS, arcPath, ringOf } from '@/skins/phone/blocks/year-ring';

import '@/skins/phone/css/stats.css';

/**
 * The ring of the years widget: one arc for each year of the career (the last one, the year I am in, in the full accent and the others a
 * little lighter), and its number exactly in the middle (so it lines up with the number of the widget beside it) and the word for it under (kept for readers only when the ring is too small to hold it inside). The picture is decoration (`aria-hidden`); the words in the middle carry the
 * meaning. It takes the width of its box, up to a size, and stays square.
 */
export function HomeYearRing({
  years,
  unit,
  children,
}: {
  years: number;
  /** the word under the number ("years") */
  unit: string;
  children: ReactNode;
}) {
  const ring = ringOf(years);
  const delays = arcDelays(Math.max(1, ring.arcs.length));
  return (
    <div className='@container relative aspect-square w-full max-w-36'>
      <svg
        aria-hidden='true'
        data-testid='years-ring'
        viewBox='0 0 100 100'
        className='absolute inset-0 size-full fill-none'
        strokeWidth={ring.stroke}
      >
        {ring.full && (
          <circle
            cx='50'
            cy='50'
            r={RING_RADIUS}
            className='ph-arc stroke-ph-accent'
            style={delayStyle(delays[0])}
          />
        )}
        {ring.arcs.map((arc, index) => (
          <path
            key={arc.from}
            d={arcPath(arc)}
            className={cn(
              'ph-arc',
              index === ring.arcs.length - 1
                ? 'stroke-ph-accent'
                : 'stroke-ph-accent/75',
            )}
            style={delayStyle(delays[index])}
          />
        ))}
      </svg>
      <div className='absolute inset-0 grid place-content-center text-center'>
        {children}
      </div>
      <span className='absolute inset-x-0 top-[calc(50%+1.3rem)] text-center text-[13px]/[1.2] font-semibold text-ph-mute @max-[7rem]:sr-only'>
        {unit}
      </span>
    </div>
  );
}
