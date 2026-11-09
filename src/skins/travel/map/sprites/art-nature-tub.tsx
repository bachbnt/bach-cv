/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { WASH_DARK } from '@/skins/travel/map/sprites/art-parts';

/** A wooden mud tub for one bather, the kind the hot spring rents by the hour. */
export function MudTub({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <ellipse cx={x} cy={y + 3} rx={7.6} ry={3.8} className='fill-tl-trunk' />
      <ellipse
        cx={x}
        cy={y + 3}
        rx={7.6}
        ry={3.8}
        className={WASH_DARK}
        opacity={0.3}
      />
      <ellipse cx={x} cy={y} rx={7.6} ry={3.8} className='fill-tl-soil' />
      <ellipse
        cx={x}
        cy={y + 0.4}
        rx={5.6}
        ry={2.7}
        className='fill-tl-rock'
        opacity={0.7}
      />
      <ellipse
        cx={x - 1.6}
        cy={y - 0.2}
        rx={2.2}
        ry={1}
        className='fill-tl-foam'
        opacity={0.3}
      />
    </g>
  );
}
