/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { floor } from '@/skins/travel/map/sprites/art-theatre-frame';
import { fmt } from '@/skins/travel/map/sprites/art-town-math';

const POLES = [
  { u: -14, s: -30, flag: 'fill-tl-coral' },
  { u: -14, s: 30, flag: 'fill-tl-sun' },
] as const;
const HEIGHT = 46;

/** Two tall banner poles at the ends of the plaza, each with a pennant flying to the right. */
export function TheatreFlags() {
  return (
    <g>
      {POLES.map(({ u, s, flag }) => {
        const [x, y] = floor(u, s, -6);
        const top = y - HEIGHT;
        return (
          <g key={s}>
            <path
              d={`M${fmt(x)} ${fmt(y)}V${fmt(top)}`}
              className='fill-none stroke-tl-trunk'
              strokeWidth={1.3}
              strokeLinecap='round'
            />
            <path
              d={`M${fmt(x)} ${fmt(top + 1)}q9 -1 14 3q-6 2 -14 12z`}
              className={flag}
            />
            <circle cx={x} cy={top} r={1.2} className='fill-tl-sun' />
          </g>
        );
      })}
    </g>
  );
}
