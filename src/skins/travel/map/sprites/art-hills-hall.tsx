/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { RoofTiles } from '@/skins/travel/map/sprites/art-hills-tiles';
import {
  Box,
  OnFace,
  Roof,
  WASH_DARK,
  Win,
  type BoxShape,
} from '@/skins/travel/map/sprites/art-parts';

const LOW: BoxShape = { cx: 0, y: 0, wl: 24, wr: 18, h: 11 };
const UP: BoxShape = { cx: -1, y: -17, wl: 14, wr: 10, h: 9 };
const wider = (b: BoxShape, by: number): BoxShape => ({
  cx: b.cx,
  y: b.y + by,
  wl: b.wl + 6,
  wr: b.wr + 6,
  h: b.h + by,
});

/** The pagoda hall of Long Son: a plinth, a white hall with a door and windows, and two tiers of upturned glazed-tile roofs. */
export function PagodaHall({
  x,
  y,
  s = 1,
}: {
  x: number;
  y: number;
  s?: number;
}) {
  const eave1 = wider(LOW, 3);
  const eave2 = wider(UP, 3);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <Box shape={{ cx: 0, y: 3, wl: 30, wr: 24, h: 3 }} wall='fill-tl-stone' />
      <Box shape={LOW} wall='fill-tl-wall' />
      <OnFace shape={LOW} side='l' at={0.5}>
        <path
          d='M-3.6 0 v-7 a3.6 3.6 0 0 1 7 0 v7z'
          className='fill-tl-soil-2'
          opacity={0.8}
        />
        <Win x={-10} y={-3} w={4} h={6} shutters />
        <Win x={10} y={-3} w={4} h={6} shutters />
      </OnFace>
      <Roof shape={eave1} roof='fill-tl-brick' rise={8} curve={3} />
      <RoofTiles shape={eave1} rise={8} />
      <Box shape={UP} wall='fill-tl-wall' />
      <OnFace shape={UP} side='l' at={0.5}>
        <Win x={0} y={-2} w={4} h={5} arch />
      </OnFace>
      <Roof shape={eave2} roof='fill-tl-brick' rise={9} curve={3} />
      <RoofTiles shape={eave2} rise={9} />
      <path
        d='M-3 -43 v-9'
        className='stroke-tl-sun'
        strokeWidth={1.4}
        strokeLinecap='round'
      />
      <circle cx={-3} cy={-52.5} r={1.4} className='fill-tl-sun' />
      <ellipse
        cx={-9}
        cy={5.6}
        rx={5}
        ry={1.4}
        className={WASH_DARK}
        opacity={0.2}
      />
    </g>
  );
}
