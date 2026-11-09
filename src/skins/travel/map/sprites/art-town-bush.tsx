/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { WASH_DARK, WASH_LIGHT } from '@/skins/travel/map/sprites/art-parts';

/** A clipped garden shrub: a dark body and a lit crown on the upper left. */
export function Bush({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={-3.4} rx={6} ry={4.2} className='fill-tl-leaf' />
      <ellipse
        cx={1.6}
        cy={-2.4}
        rx={4.2}
        ry={3}
        className={WASH_DARK}
        opacity={0.22}
      />
      <ellipse
        cx={-1.8}
        cy={-5}
        rx={2.8}
        ry={1.8}
        className={WASH_LIGHT}
        opacity={0.3}
      />
    </g>
  );
}
