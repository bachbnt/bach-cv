/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { WASH_DARK, WASH_LIGHT } from '@/skins/travel/map/sprites/art-parts';

/** A pine: a thin trunk and three tiers of needles, lit from the upper left. */
export function Pine({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-1} y={-6} width={2} height={6} className='fill-tl-trunk' />
      <path
        d='M-9 -5 L0 -17 L9 -5z M-7.5 -13 L0 -24 L7.5 -13z M-5.5 -21 L0 -31 L5.5 -21z'
        className='fill-tl-leaf'
      />
      <path
        d='M0 -17 L9 -5 L1 -5z M0 -24 L7.5 -13 L1 -13z M0 -31 L5.5 -21 L1 -21z'
        className={WASH_DARK}
        opacity={0.24}
      />
      <path
        d='M-9 -5 L0 -17 L-3 -5z M-7.5 -13 L0 -24 L-3 -13z'
        className={WASH_LIGHT}
        opacity={0.18}
      />
    </g>
  );
}
