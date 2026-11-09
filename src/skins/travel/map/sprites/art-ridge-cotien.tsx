/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import {
  Box,
  Mound,
  Shadow,
  Tree,
  WASH_DARK,
} from '@/skins/travel/map/sprites/art-parts';
import { Crag } from '@/skins/travel/map/sprites/art-ridge-crag';
import { Grove } from '@/skins/travel/map/sprites/art-ridge-grove';
import { Mist } from '@/skins/travel/map/sprites/art-ridge-mist';

/** The ridge seen from the city: a head, the rise of the chest, the knees and a long gentle slope to the feet. */
const RIDGE =
  'M4 144 C4 120 8 92 20 84 C28 78 38 82 41 92 C43 98 44 100 48 98 C54 92 56 70 64 58 C70 50 80 46 86 54 C92 62 94 72 98 78 C102 82 104 70 112 64 C120 58 128 62 132 70 C138 82 142 90 146 92 C150 92 152 100 153 112 C155 124 155 134 154 144 C130 152 30 152 4 144Z';

/** The shaded flank of each peak: the right side down to its gully. */
const FLANKS = [
  'M30 79 C35 79 40 85 41 92 C43 98 44 100 46 102 C44 116 46 130 50 146 L40 146 C36 128 38 112 34 100 C32 92 31 84 30 79Z',
  'M76 50 C80 50 84 52 86 54 C92 62 94 72 98 78 C99 80 100 84 100 90 C96 118 100 134 104 148 L90 148 C88 124 84 100 80 80 C78 68 77 58 76 50Z',
  'M120 60 C128 62 132 66 132 70 C138 82 142 90 146 92 C150 92 152 100 153 112 C155 124 155 134 154 144 L134 150 C130 124 124 92 120 60Z',
];

/** Crown clumps, [x, y, width, lit]; the ones on the right flanks sit in shade. */
const GROVES: readonly (readonly [number, number, number, boolean])[] = [
  [12, 106, 11, true],
  [22, 100, 13, true],
  [14, 122, 18, true],
  [24, 112, 15, true],
  [26, 130, 20, true],
  [10, 138, 15, true],
  [32, 142, 20, true],
  [58, 90, 13, true],
  [52, 110, 17, true],
  [46, 136, 20, true],
  [58, 124, 20, true],
  [70, 98, 17, true],
  [72, 128, 20, true],
  [70, 142, 22, true],
  [64, 78, 11, true],
  [106, 94, 13, true],
  [112, 106, 17, true],
  [106, 124, 18, true],
  [114, 136, 20, true],
  [40, 112, 13, false],
  [44, 126, 14, false],
  [84, 70, 11, false],
  [88, 88, 14, false],
  [92, 106, 17, false],
  [86, 126, 20, false],
  [90, 142, 20, false],
  [128, 80, 11, false],
  [134, 94, 14, false],
  [128, 112, 20, false],
  [142, 116, 17, false],
  [124, 132, 21, false],
  [142, 136, 20, false],
];

/** Nui Co Tien, the "fairy mountain": three rounded peaks whose outline lies like a woman on her back, forested, with rocky crowns, a mist tuft on the crest and a switchback path to a viewing platform. */
export function CoTienArt() {
  return (
    <g>
      <defs>
        <linearGradient id='tl-cotien-slope' x1='0' y1='0' x2='0' y2='1'>
          <stop offset='0' style={{ stopColor: 'var(--tl-hill-t)' }} />
          <stop offset='0.45' style={{ stopColor: 'var(--tl-hill-s)' }} />
          <stop offset='1' style={{ stopColor: 'var(--tl-hill-w)' }} />
        </linearGradient>
      </defs>
      <Shadow rx={74} ry={9} cy={148} />
      <path d={RIDGE} fill='url(#tl-cotien-slope)' />
      <path
        d='M6 108 C10 92 16 86 24 82 M56 80 C60 68 64 58 70 52 M104 76 C108 68 112 64 118 60'
        className='fill-none stroke-tl-foam'
        strokeOpacity={0.4}
        strokeWidth={1.2}
        strokeLinecap='round'
      />
      {GROVES.map(([x, y, w, lit]) => (
        <Grove key={`${x}-${y}`} x={x} y={y} w={w} lit={lit} />
      ))}
      {FLANKS.map((d) => (
        <path key={d} d={d} className={WASH_DARK} opacity={0.28} />
      ))}
      <Crag x={72} y={58} w={12} h={9} lean={-1} />
      <Crag x={82} y={57} w={9} h={6} />
      <Crag x={29} y={86} w={9} h={7} />
      <Crag x={118} y={67} w={11} h={8} />
      <path
        d='M52 140 C70 136 80 132 64 126 C52 122 70 116 80 112 C88 108 66 104 60 100 C56 96 72 92 78 88 C82 84 70 82 68 76'
        className='fill-none stroke-tl-sand'
        strokeOpacity={0.9}
        strokeWidth={0.9}
        strokeLinejoin='round'
      />
      <Box
        shape={{ cx: 68, y: 76, wl: 3.5, wr: 3.5, h: 1.6 }}
        wall='fill-tl-sand'
      />
      <path
        d='M65 72 v-6 M65 66 l5 1.5 l-5 1.6z'
        className='fill-none stroke-tl-coral'
        strokeWidth={0.8}
        strokeLinecap='round'
      />
      <Mist x={90} y={50} w={34} h={8} />
      <Mist x={28} y={82} w={18} h={5} opacity={0.55} />
      <Mound x={22} y={148} w={40} h={14} />
      <Mound x={128} y={148} w={44} h={13} />
      <Mound x={80} y={150} w={36} h={9} />
      <Tree x={12} y={146} s={0.8} />
      <Tree x={142} y={148} s={0.9} />
      <Tree x={102} y={149} s={0.7} />
    </g>
  );
}
