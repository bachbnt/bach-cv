/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import {
  Palm,
  Shadow,
  Tree,
  WASH_DARK,
} from '@/skins/travel/map/sprites/art-parts';
import { Cascade } from '@/skins/travel/map/sprites/art-ridge-cascade';
import { Crag } from '@/skins/travel/map/sprites/art-ridge-crag';
import { Grove } from '@/skins/travel/map/sprites/art-ridge-grove';
import { Mist } from '@/skins/travel/map/sprites/art-ridge-mist';

/** The massif: a main summit, a saddle and a second, rounder shoulder on the right, steep on both sides. */
const MASSIF =
  'M4 146 C6 128 14 112 26 100 C34 92 38 82 44 70 L50 56 C54 44 58 30 64 20 L70 10 L74 14 L78 24 C82 32 86 36 90 42 L96 40 L104 34 C108 32 114 32 120 38 C124 44 127 50 130 58 C136 72 144 92 148 112 C152 126 154 138 156 146 C120 154 40 154 4 146Z';

/** The shaded faces on the right of the summit and of the shoulder, down to the foot. */
const FLANKS = [
  'M70 10 L74 14 L78 24 C82 32 86 36 90 42 L94 46 C94 70 98 100 100 150 L74 150 C76 110 78 80 72 50 C71 36 71 22 70 10Z',
  'M112 33 C116 34 122 40 124 44 C127 50 128 54 130 58 C136 72 144 92 148 112 C152 126 154 138 156 146 L124 152 C120 110 114 70 112 33Z',
];

/** Forest clumps, [x, y, width, tone]: grassy dwarf forest high up, dense dark forest down the slope. */
const HIGH = 'fill-tl-hill-w';
const GROVES: readonly (readonly [number, number, number, string])[] = [
  [58, 64, 9, HIGH],
  [46, 80, 11, HIGH],
  [62, 84, 11, HIGH],
  [106, 62, 10, HIGH],
  [108, 78, 12, HIGH],
  [128, 76, 12, HIGH],
  [44, 98, 15, 'fill-tl-leaf'],
  [58, 102, 14, 'fill-tl-leaf'],
  [34, 112, 15, 'fill-tl-leaf'],
  [48, 118, 17, 'fill-tl-leaf'],
  [64, 118, 16, 'fill-tl-leaf'],
  [14, 128, 16, 'fill-tl-leaf'],
  [28, 132, 20, 'fill-tl-leaf'],
  [44, 136, 20, 'fill-tl-leaf'],
  [62, 136, 20, 'fill-tl-leaf'],
  [82, 70, 10, 'fill-tl-leaf'],
  [84, 98, 12, 'fill-tl-leaf'],
  [78, 84, 9, 'fill-tl-leaf'],
  [86, 116, 16, 'fill-tl-leaf'],
  [82, 136, 20, 'fill-tl-leaf'],
  [108, 100, 13, 'fill-tl-leaf'],
  [112, 120, 16, 'fill-tl-leaf'],
  [106, 138, 20, 'fill-tl-leaf'],
  [136, 100, 14, 'fill-tl-leaf'],
  [120, 94, 12, 'fill-tl-leaf'],
  [124, 110, 12, 'fill-tl-leaf'],
  [130, 118, 18, 'fill-tl-leaf'],
  [144, 130, 16, 'fill-tl-leaf'],
  [126, 138, 20, 'fill-tl-leaf'],
  [20, 148, 30, 'fill-tl-leaf'],
  [60, 150, 34, 'fill-tl-leaf'],
  [102, 150, 32, 'fill-tl-leaf'],
  [138, 148, 32, 'fill-tl-leaf'],
];

/** Nui Dong Bo, the tallest range behind the city: a steep massif with a main summit and a second shoulder, dark forest layered by altitude, grey cliffs, a stream down a gully and low cloud around its upper third. */
export function DongBoArt() {
  return (
    <g>
      <defs>
        <linearGradient id='tl-dongbo-slope' x1='0' y1='0' x2='0' y2='1'>
          <stop offset='0' style={{ stopColor: 'var(--tl-mtn-s)' }} />
          <stop offset='0.45' style={{ stopColor: 'var(--tl-mtn-w)' }} />
          <stop offset='1' style={{ stopColor: 'var(--tl-mtn-w)' }} />
        </linearGradient>
        <linearGradient id='tl-dongbo-water' x1='0' y1='0' x2='0' y2='1'>
          <stop offset='0' style={{ stopColor: 'var(--tl-foam)' }} />
          <stop offset='1' style={{ stopColor: 'var(--tl-river)' }} />
        </linearGradient>
      </defs>
      <Shadow rx={74} ry={9} cy={148} />
      <path d={MASSIF} fill='url(#tl-dongbo-slope)' />
      <path d={MASSIF} className={WASH_DARK} opacity={0.1} />
      {GROVES.map(([x, y, w, tone]) => (
        <Grove key={`${x}-${y}`} x={x} y={y} w={w} tone={tone} lit={x < 74} />
      ))}
      <Crag x={68} y={32} w={22} h={24} lean={1} />
      <Crag x={112} y={52} w={16} h={16} lean={-1} />
      <Crag x={44} y={74} w={14} h={14} />
      {FLANKS.map((d) => (
        <path key={d} d={d} className={WASH_DARK} opacity={0.24} />
      ))}
      <path
        d='M26 100 C34 92 38 82 44 70 L50 56 C54 44 58 30 64 20 L70 10'
        className='fill-none stroke-tl-mtn-t'
        strokeOpacity={0.45}
        strokeWidth={1.2}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M66 30 C62 44 60 58 62 74 M96 42 C98 58 95 78 98 98'
        className='fill-none stroke-tl-rock'
        strokeOpacity={0.45}
        strokeWidth={0.9}
        strokeLinecap='round'
      />
      <Mist x={66} y={58} w={38} h={9} />
      <Mist x={108} y={46} w={38} h={8} opacity={0.6} />
      <Mist x={76} y={30} w={22} h={5} opacity={0.5} />
      <Cascade
        path='M90 62 L90 80 L87 82 L87 100 L91 103 L91 122 L89 124 L92 140'
        poolX={92}
        poolY={146}
        gradient='tl-dongbo-water'
      />
      <Tree x={10} y={148} s={1.3} />
      <Tree x={148} y={150} s={1.4} />
      <Palm x={124} y={152} s={0.8} lean={-1} />
    </g>
  );
}
