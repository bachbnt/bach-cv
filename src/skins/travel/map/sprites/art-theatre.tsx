/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import {
  Box,
  type BoxShape,
  Palm,
  Shadow,
  WASH_DARK,
} from '@/skins/travel/map/sprites/art-parts';
import { floor } from '@/skins/travel/map/sprites/art-theatre-frame';
import { TheatreFlags } from '@/skins/travel/map/sprites/art-theatre-flags';
import { TheatrePlaza } from '@/skins/travel/map/sprites/art-theatre-plaza';
import { fmt } from '@/skins/travel/map/sprites/art-town-math';
import { TheatreShow } from '@/skins/travel/map/sprites/art-theatre-show';
import { TheatreLights } from '@/skins/travel/map/sprites/art-theatre-lights';
import { TrapShell } from '@/skins/travel/map/sprites/art-theatre-shell';

const STAGE_FRONT = floor(-10, 34, -6);

/** A block of the stage: its front corner stands at (u, s) of the stage floor, or `lift` above it. */
const tier = (
  u: number,
  s: number,
  wl: number,
  wr: number,
  h: number,
  lift = 0,
): BoxShape => {
  const [cx, y] = floor(u, s, lift);
  return { cx, y, wl, wr, h };
};

const line = (a: readonly [number, number], b: readonly [number, number]) =>
  `M${fmt(a[0])} ${fmt(a[1])}L${fmt(b[0])} ${fmt(b[1])}`;
const PAVING = [
  ...[2, 14, 26, 38].map((u) => line(floor(u, -34, 0), floor(u, 34, 0))),
  ...[-22, -8, 6, 20].map((s) => line(floor(-10, s, 0), floor(48, s, 0))),
].join('');
const SHADE = floor(22, 4, 0);

/** Do Theatre (Nha hat Do): a giant woven-bamboo fish trap with a lit mouth on a stage, a plaza for the audience, the beach and the sea. */
export function DoTheatreArt() {
  return (
    <g>
      <Shadow rx={70} cx={82} cy={146} ry={10} />
      <ellipse cx={82} cy={143} rx={76} ry={12} className='fill-tl-sand-2' />
      <ellipse cx={80} cy={142} rx={70} ry={9.5} className='fill-tl-sand' />
      <ellipse cx={124} cy={148} rx={36} ry={9} className='fill-tl-sea-2' />
      <ellipse cx={125} cy={147.5} rx={29} ry={6.4} className='fill-tl-sea-1' />
      <path
        d='M104 148q6 -2.4 12 0t12 0t12 0M110 151.4q5 -2 10 0t10 0'
        className='fill-none stroke-tl-foam'
        strokeWidth={1}
        strokeLinecap='round'
        opacity={0.85}
      />
      <path
        d='M30 147h0M52 149.4h0M70 146.6h0M94 149h0M8 143h0'
        className='fill-none stroke-tl-sand-2'
        strokeWidth={1.6}
        strokeLinecap='round'
      />
      <TheatrePlaza />
      <Box
        shape={{
          cx: STAGE_FRONT[0],
          y: STAGE_FRONT[1],
          wl: 68,
          wr: 58,
          h: 6,
        }}
        wall='fill-tl-stone'
        top='fill-tl-walk'
      />
      <path
        d={PAVING}
        className='fill-none stroke-tl-soil-2'
        strokeOpacity={0.16}
        strokeWidth={0.7}
      />
      <ellipse
        cx={SHADE[0]}
        cy={SHADE[1]}
        rx={40}
        ry={12}
        transform={`rotate(-26.6 ${SHADE[0]} ${SHADE[1]})`}
        className={WASH_DARK}
        opacity={0.22}
      />
      <Box
        shape={tier(-18, 14, 28, 4, 2, -6)}
        wall='fill-tl-stone'
        top='fill-tl-walk'
      />
      <Box
        shape={tier(-14, 14, 28, 4, 4, -6)}
        wall='fill-tl-stone'
        top='fill-tl-walk'
      />
      <Box
        shape={tier(16, 30, 60, 34, 10)}
        wall='fill-tl-rock-2'
        top='fill-tl-stone'
      />
      <Box
        shape={tier(36, 22, 44, 16, 20)}
        wall='fill-tl-rock-2'
        top='fill-tl-stone'
      />
      <TrapShell />
      <TheatreShow />
      <TheatreLights />
      <TheatreFlags />
      <Palm x={112} y={143} s={0.8} lean={-1} />
      <Palm x={148} y={138} s={0.6} lean={1} />
    </g>
  );
}
