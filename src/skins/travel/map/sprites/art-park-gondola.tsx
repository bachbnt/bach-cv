/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { WASH_LIGHT } from '@/skins/travel/map/sprites/art-parts';

/** A cable-car cabin hanging from its arm: a rounded red body, a window band and a pale roof. Hangs from (x, y). */
export function Gondola({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d='M0 0 v5' className='stroke-tl-ink' strokeWidth={1} />
      <rect
        x={-8}
        y={5}
        width={16}
        height={12}
        rx={3}
        className='fill-tl-coral'
      />
      <rect
        x={-6.4}
        y={7.6}
        width={12.8}
        height={5}
        rx={1.4}
        className='fill-tl-glass'
      />
      <path d='M0 7.6 v5' className='stroke-tl-coral' strokeWidth={0.8} />
      <rect
        x={-8}
        y={5}
        width={16}
        height={3.6}
        rx={1.8}
        className={WASH_LIGHT}
        opacity={0.35}
      />
    </g>
  );
}
