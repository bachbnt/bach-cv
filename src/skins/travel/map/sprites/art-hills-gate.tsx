/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { RoofTiles } from '@/skins/travel/map/sprites/art-hills-tiles';
import {
  Box,
  OnFace,
  Roof,
  type BoxShape,
} from '@/skins/travel/map/sprites/art-parts';

const POST: BoxShape = { cx: 0, y: 0, wl: 14, wr: 8, h: 13 };
const EAVE: BoxShape = { cx: 0, y: 2, wl: 18, wr: 12, h: 15 };

/** The gate at the foot of the stair: a white arch under a small curved tiled roof. */
export function PagodaGate({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(1.15)`}>
      <Box shape={POST} wall='fill-tl-wall' />
      <OnFace shape={POST} side='l' at={0.5}>
        <path
          d='M-3.6 0 v-6 a3.6 3.6 0 0 1 7.2 0 v6z'
          className='fill-tl-soil-2'
          opacity={0.75}
        />
      </OnFace>
      <Roof shape={EAVE} roof='fill-tl-brick' rise={6} curve={2.4} />
      <RoofTiles shape={EAVE} rise={6} rows={2} />
    </g>
  );
}
