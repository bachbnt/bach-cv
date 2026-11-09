/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import {
  Box,
  WASH_DARK,
  type BoxShape,
} from '@/skins/travel/map/sprites/art-parts';

const PLINTH: BoxShape = { cx: 0, y: 0, wl: 28, wr: 12, h: 5 };

/** The reclining Buddha halfway up Long Son: a white figure lying on its right side along a plinth, head on a hand, robe folds. */
export function RecliningBuddha({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <Box shape={PLINTH} wall='fill-tl-stone' />
      <g transform='translate(-8 -14.5) rotate(26.57) scale(0.92)'>
        <rect
          x={-19}
          y={-9}
          width={38}
          height={8}
          rx={4}
          className='fill-tl-wall'
        />
        <rect
          x={-19}
          y={-4}
          width={38}
          height={3}
          rx={1.5}
          className={WASH_DARK}
          opacity={0.2}
        />
        <circle cx={-19} cy={-8} r={4.8} className='fill-tl-wall' />
        <circle cx={-19.6} cy={-13.2} r={1.7} className='fill-tl-wall' />
        <ellipse
          cx={-14}
          cy={-11.6}
          rx={4.4}
          ry={2.4}
          className={WASH_DARK}
          opacity={0.2}
        />
        <path d='M15 -8 q5 1 6 4 q-4 1 -7 0z' className='fill-tl-wall' />
        <path
          d='M-8 -8 q2 4 0 7 M0 -8 q2 4 0 7 M8 -8 q2 4 0 7 M-22 -9 q1.4 1 2.6 0'
          className='fill-none stroke-tl-soil-2'
          strokeOpacity={0.3}
          strokeWidth={0.7}
          strokeLinecap='round'
        />
      </g>
    </g>
  );
}
