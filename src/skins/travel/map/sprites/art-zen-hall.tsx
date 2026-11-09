/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { RoofTiles } from '@/skins/travel/map/sprites/art-hills-tiles';
import {
  Box,
  OnFace,
  Roof,
  Win,
  type BoxShape,
} from '@/skins/travel/map/sprites/art-parts';

const BODY: BoxShape = { cx: 0, y: 0, wl: 16, wr: 14, h: 8 };
const EAVE: BoxShape = { cx: 0, y: 2, wl: 20, wr: 18, h: 10 };

/** The main hall of the monastery: a white hall with red-brown pillars and doors under one wide, curved roof of tiles. */
export function MonasteryHall({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <Box shape={BODY} wall='fill-tl-wall' />
      <OnFace shape={BODY} side='l' at={0.5}>
        <path
          d='M-3 0 v-5.6 a3 3 0 0 1 6 0 v5.6z'
          className='fill-tl-soil-2'
          opacity={0.8}
        />
        <Win x={-9} y={-2.4} w={3.4} h={5} arch />
        <Win x={9} y={-2.4} w={3.4} h={5} arch />
      </OnFace>
      <Roof shape={EAVE} roof='fill-tl-brick' rise={9} curve={3} />
      <RoofTiles shape={EAVE} rise={9} rows={3} />
    </g>
  );
}
