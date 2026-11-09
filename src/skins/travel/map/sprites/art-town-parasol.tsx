/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { WASH_DARK } from '@/skins/travel/map/sprites/art-parts';

/** A market stall under a parasol: `canopy` is a `fill-tl-*` class, (x, y) is where the pole meets the ground. */
export function Parasol({
  x,
  y,
  canopy,
}: {
  x: number;
  y: number;
  canopy: string;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse
        cx={1}
        cy={0.5}
        rx={7}
        ry={2.6}
        className={WASH_DARK}
        opacity={0.22}
      />
      <path d='M0 0V-15' className='stroke-tl-soil-2' strokeWidth={1} />
      <path
        d='M-8 -11L0 -17L8 -11Q4 -9 0 -10.5Q-4 -9 -8 -11z'
        className={canopy}
      />
      <path
        d='M0 -17L8 -11Q4 -9 0 -10.5z'
        className={WASH_DARK}
        opacity={0.26}
      />
    </g>
  );
}
