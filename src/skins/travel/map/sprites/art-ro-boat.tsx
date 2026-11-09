/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { WASH_DARK, WASH_LIGHT } from '@/skins/travel/map/sprites/art-parts';

/**
 * A wooden fishing boat, seen from the side while it lies along the right-hand axis of the map: a high bow, a white band, a small
 * wheelhouse and a mast with a lamp. `roof` is a `fill-tl-*` class. Stands on (x, y) at the waterline.
 */
export function FishingBoat({
  x,
  y,
  roof,
  s = 1,
}: {
  x: number;
  y: number;
  roof: string;
  s?: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse
        cx={0}
        cy={1}
        rx={15}
        ry={3.4}
        className='fill-none stroke-tl-foam'
        strokeOpacity={0.8}
        strokeWidth={0.9}
      />
      <g transform='skewY(-26.57)'>
        <path
          d='M-12 -4 H11 L14 -7 L9 2.4 Q0 4 -9 2.4z'
          className='fill-tl-hull'
        />
        <path d='M-12 -4 H11 L14 -7 L13 -5 H-12z' className='fill-tl-foam' />
        <path
          d='M-9 2.4 Q0 4 9 2.4 L10 0.8 Q0 2.6 -10 0.8z'
          className={WASH_DARK}
          opacity={0.3}
        />
        <rect x={-6} y={-10} width={7} height={6} className='fill-tl-wall' />
        <rect
          x={-4.6}
          y={-8.6}
          width={3.4}
          height={2.6}
          className='fill-tl-glass'
        />
        <rect
          x={-7.4}
          y={-11.8}
          width={10}
          height={2}
          rx={1}
          className={roof}
        />
        <path
          d='M-7.4 -11.8 h10 v0.8 h-10z'
          className={WASH_LIGHT}
          opacity={0.3}
        />
        <path
          d='M7 -5 V-15'
          className='fill-none stroke-tl-trunk'
          strokeWidth={0.9}
          strokeLinecap='round'
        />
        <circle cx={7} cy={-15} r={1.2} className='fill-tl-sun' />
      </g>
    </g>
  );
}
