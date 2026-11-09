/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { ConeTower } from '@/skins/travel/map/sprites/art-park-tower';
import {
  Box,
  OnFace,
  Win,
  WASH_DARK,
  topCorners,
  type BoxShape,
} from '@/skins/travel/map/sprites/art-parts';

const KEEP: BoxShape = { cx: 114, y: 142, wl: 20, wr: 18, h: 20 };

/** The fairy-tale castle: a keep with a gate, a toothed parapet and four round towers with coloured cone roofs, two with pennants. */
export function Castle() {
  const t = topCorners(KEEP);
  const lift = (p: readonly [number, number]) => `${p[0]} ${p[1] - 1.6}`;
  return (
    <g>
      <ConeTower cx={112} y={128} h={44} r={7} roof='fill-tl-stop-3' flag />
      <ConeTower cx={130} y={126} h={24} r={5} roof='fill-tl-stop-5' />
      <Box shape={KEEP} wall='fill-tl-wall' />
      <OnFace shape={KEEP} side='l' at={0.5}>
        <path
          d='M-4 0 v-8 a4 4 0 0 1 8 0 v8z'
          className={WASH_DARK}
          opacity={0.7}
        />
        <Win x={-11} y={-9} w={3.4} h={6} arch />
        <Win x={11} y={-9} w={3.4} h={6} arch />
      </OnFace>
      <OnFace shape={KEEP} side='r' at={0.5}>
        <Win x={-5} y={-8} w={3.4} h={6} arch />
        <Win x={5} y={-8} w={3.4} h={6} arch />
      </OnFace>
      <path
        d={`M${lift(t.a)} L${lift(t.b)} L${lift(t.c)}`}
        className='fill-none stroke-tl-stone'
        strokeWidth={3}
        strokeDasharray='3 2.6'
      />
      <ConeTower cx={137} y={142} h={30} r={5.5} roof='fill-tl-stop-2' flag />
      <ConeTower cx={92} y={146} h={24} r={5.5} roof='fill-tl-stop-4' />
    </g>
  );
}
