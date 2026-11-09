/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { RoofTiles } from '@/skins/travel/map/sprites/art-hills-tiles';
import {
  Box,
  OnFace,
  Roof,
  topCorners,
  Win,
  type BoxShape,
} from '@/skins/travel/map/sprites/art-parts';

const WALLS: BoxShape = { cx: 0, y: 0, wl: 30, wr: 36, h: 17 };
const EAVES: BoxShape = { cx: 0, y: 1, wl: 34, wr: 40, h: 18 };
const RISE = 12;

/** A colonial French villa: ivory walls, a cornice, arched windows with shutters, a hipped roof of red tiles and a chimney. */
export function Villa({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  const eaves = topCorners(EAVES);
  const ridgeX = (eaves.a[0] + eaves.c[0]) / 2 + 5;
  const ridgeY = (eaves.a[1] + eaves.c[1]) / 2 - RISE + 2;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <Box shape={WALLS} wall='fill-tl-wall' />
      <OnFace shape={WALLS} side='l' at={0.5}>
        <path
          d='M-3 0 v-8 a3 3 0 0 1 6 0 v8z'
          className='fill-tl-soil-2'
          opacity={0.8}
        />
        <Win x={-10} y={-4} w={4.4} h={9} shutters arch />
        <Win x={10} y={-4} w={4.4} h={9} shutters arch />
        <path d='M-15 -14 h30' className='stroke-tl-stone' strokeWidth={1.4} />
      </OnFace>
      <OnFace shape={WALLS} side='r' at={0.5}>
        <Win x={-8} y={-4} w={4.4} h={9} arch />
        <Win x={8} y={-4} w={4.4} h={9} arch />
        <path d='M-18 -14 h36' className='stroke-tl-stone' strokeWidth={1.4} />
      </OnFace>
      <Roof shape={EAVES} roof='fill-tl-roof' rise={RISE} />
      <RoofTiles shape={EAVES} rise={RISE} rows={3} />
      <Box
        shape={{ cx: ridgeX, y: ridgeY + 3, wl: 3, wr: 3, h: 8 }}
        wall='fill-tl-stone'
      />
    </g>
  );
}
