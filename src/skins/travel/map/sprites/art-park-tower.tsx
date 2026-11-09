/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { Cylinder, WASH_DARK } from '@/skins/travel/map/sprites/art-parts';

/** A round tower of the fairy-tale castle with a conical roof (`roof` is a `fill-tl-*` class) and, if asked, a pennant. */
export function ConeTower({
  cx,
  y,
  h,
  r = 6,
  roof,
  flag = false,
}: {
  cx: number;
  y: number;
  h: number;
  r?: number;
  roof: string;
  flag?: boolean;
}) {
  const top = y - h;
  const tip = top - r * 3.4;
  return (
    <g>
      <Cylinder cx={cx} y={y} r={r} h={h} wall='fill-tl-wall' />
      <path
        d={`M${cx - 1.6} ${y - h * 0.45} v-4 a1.6 1.6 0 0 1 3.2 0 v4z`}
        className='fill-tl-glass'
      />
      <path
        d={`M${cx - r - 2.4} ${top + 1} L${cx} ${tip} L${cx + r + 2.4} ${top + 1} Q${cx} ${top + 5.6} ${cx - r - 2.4} ${top + 1}z`}
        className={roof}
      />
      <path
        d={`M${cx} ${tip} L${cx + r + 2.4} ${top + 1} Q${cx + r * 0.5} ${top + 4.6} ${cx} ${top + 4.4}z`}
        className={WASH_DARK}
        opacity={0.28}
      />
      {flag && (
        <g>
          <path
            d={`M${cx} ${tip} v-7`}
            className='stroke-tl-ink'
            strokeWidth={0.9}
          />
          <path
            d={`M${cx} ${tip - 7} q5 -2 9 0 q-4 2 -9 4z`}
            className='tl-flag fill-tl-sun'
          />
        </g>
      )}
    </g>
  );
}
