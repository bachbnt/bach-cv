/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { WASH_DARK } from '@/skins/travel/map/sprites/art-parts';

/** A round basket boat (thuyen thung): a woven bowl with a dark inside and a paddle across it. Sits on (x, y). */
export function BasketBoat({
  x,
  y,
  s = 1,
}: {
  x: number;
  y: number;
  s?: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={1.8} rx={7} ry={3.5} className='fill-tl-soil' />
      <ellipse
        cx={0}
        cy={1.8}
        rx={7}
        ry={3.5}
        className={WASH_DARK}
        opacity={0.3}
      />
      <ellipse cx={0} cy={0} rx={7} ry={3.5} className='fill-tl-sand-2' />
      <ellipse cx={0} cy={0.3} rx={5.4} ry={2.5} className='fill-tl-soil-2' />
      <path
        d='M-7 -4.5L7 3'
        className='fill-none stroke-tl-trunk'
        strokeWidth={1}
        strokeLinecap='round'
      />
    </g>
  );
}
