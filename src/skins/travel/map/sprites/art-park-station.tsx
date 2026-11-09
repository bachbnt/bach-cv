/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import {
  Box,
  OnFace,
  Roof,
  WASH_DARK,
  Win,
  type BoxShape,
} from '@/skins/travel/map/sprites/art-parts';

const HALL: BoxShape = { cx: 36, y: 140, wl: 28, wr: 20, h: 16 };
const PLATFORM: BoxShape = { cx: 62, y: 148, wl: 13, wr: 7, h: 3 };

/** The cable-car station: a long hall with a sloping gable roof and a glazed front, and a platform with a railing along its edge. */
export function Station() {
  return (
    <g>
      <Box shape={PLATFORM} wall='fill-tl-stone' />
      <path
        d='M49 133 V142.5 M55.5 136.2 V145.7 M62 139.5 V149 M69 136 V145.5'
        className='fill-none stroke-tl-rock'
        strokeWidth={0.9}
      />
      <path
        d='M49 133 L62 139.5 L69 136'
        className='fill-none stroke-tl-rock-2'
        strokeWidth={1.1}
        strokeLinejoin='round'
      />
      <Box shape={HALL} wall='fill-tl-wall' />
      <OnFace shape={HALL} side='l' at={0.5}>
        <rect
          x={-16}
          y={-11}
          width={18}
          height={9}
          rx={1}
          className='fill-tl-glass'
        />
        <path
          d='M-10 -11 V-2 M-4 -11 V-2'
          className='stroke-tl-ink'
          strokeOpacity={0.35}
          strokeWidth={0.6}
        />
        <path
          d='M6 0 v-9 a3.6 3.6 0 0 1 7.2 0 v9z'
          className={WASH_DARK}
          opacity={0.75}
        />
        <rect
          x={-16}
          y={-14}
          width={28}
          height={2.6}
          className='fill-tl-stop-2'
        />
      </OnFace>
      <OnFace shape={HALL} side='r' at={0.5}>
        <Win x={-5} y={-5} w={5} h={6} />
        <Win x={7} y={-5} w={5} h={6} />
      </OnFace>
      <Roof
        shape={{ ...HALL, y: HALL.y - HALL.h, h: 0, wl: 31, wr: 23 }}
        roof='fill-tl-roof'
        gable
        rise={11}
        end='fill-tl-wall'
      />
    </g>
  );
}
