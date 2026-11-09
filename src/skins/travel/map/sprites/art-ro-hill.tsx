/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { Crag } from '@/skins/travel/map/sprites/art-ridge-crag';
import { Grove } from '@/skins/travel/map/sprites/art-ridge-grove';
import { WASH_DARK } from '@/skins/travel/map/sprites/art-parts';

const HILL =
  'M4 108C2 92 12 78 26 68C38 60 44 46 54 36C62 28 70 22 80 22C92 22 100 30 108 40C116 52 128 62 138 72C148 82 154 92 152 100C132 102 100 116 62 120C34 122 6 118 4 108Z';

/** The shaded right side of the hill. */
const FLANK =
  'M80 22C92 22 100 30 108 40C116 52 128 62 138 72C148 82 154 92 152 100C142 104 126 108 112 112C112 90 100 50 80 22Z';

/** Tree clumps, [x, y, width, tone]: low grass up on the crown, dense forest below. */
const GROVES: readonly (readonly [number, number, number, string])[] = [
  [60, 56, 12, 'fill-tl-hill-w'],
  [96, 58, 12, 'fill-tl-hill-w'],
  [44, 80, 16, 'fill-tl-leaf'],
  [70, 76, 14, 'fill-tl-leaf'],
  [96, 82, 14, 'fill-tl-leaf'],
  [122, 80, 16, 'fill-tl-leaf'],
  [50, 102, 18, 'fill-tl-leaf'],
  [104, 100, 18, 'fill-tl-leaf'],
  [132, 98, 16, 'fill-tl-leaf'],
];

/** Hon Ro itself: a rounded forested hill with a rocky crown, a path winding down to the village and a shaded eastern flank. */
export function RoHill() {
  return (
    <g>
      <defs>
        <linearGradient id='tl-ro-slope' x1='0' y1='0' x2='0' y2='1'>
          <stop offset='0' style={{ stopColor: 'var(--tl-hill-t)' }} />
          <stop offset='0.4' style={{ stopColor: 'var(--tl-hill-s)' }} />
          <stop offset='1' style={{ stopColor: 'var(--tl-hill-w)' }} />
        </linearGradient>
      </defs>
      <path d={HILL} fill='url(#tl-ro-slope)' />
      {GROVES.map(([x, y, w, tone]) => (
        <Grove key={`${x}-${y}`} x={x} y={y} w={w} tone={tone} lit={x < 76} />
      ))}
      <path
        d='M30 88q4 -3 8 0M58 92q4 -3 8 0M84 66q4 -3 8 0M112 66q4 -3 8 0M120 94q4 -3 8 0M74 92q4 -3 8 0M36 110q4 -3 8 0M92 110q4 -3 8 0M146 82q3 -3 6 0'
        className='fill-none stroke-tl-soil-2'
        strokeOpacity={0.22}
        strokeWidth={0.9}
        strokeLinecap='round'
      />
      <path d={FLANK} className={WASH_DARK} opacity={0.22} />
      <path
        d='M26 68C38 60 44 46 54 36C62 28 70 22 80 22'
        className='fill-none stroke-tl-hill-t'
        strokeOpacity={0.7}
        strokeWidth={1.4}
        strokeLinecap='round'
      />
      <path
        d='M80 40C72 46 86 52 76 60C66 68 88 74 80 84C72 94 88 98 78 108C74 112 76 116 74 120'
        className='fill-none stroke-tl-sand'
        strokeWidth={2.2}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M80 40C72 46 86 52 76 60C66 68 88 74 80 84C72 94 88 98 78 108C74 112 76 116 74 120'
        className='fill-none stroke-tl-sand-2'
        strokeOpacity={0.6}
        strokeWidth={0.7}
        strokeDasharray='2 3'
        strokeLinecap='round'
      />
      <Crag x={80} y={36} w={26} h={17} lean={2} />
      <Crag x={67} y={42} w={15} h={10} lean={-1} />
      <Crag x={95} y={43} w={13} h={9} lean={1} />
      <Grove x={76} y={44} w={10} tone='fill-tl-hill-w' lit={false} />
      <Grove x={88} y={44} w={9} tone='fill-tl-hill-w' lit={false} />
    </g>
  );
}
