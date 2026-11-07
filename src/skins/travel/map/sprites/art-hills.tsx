/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import {
  Box,
  Boulder,
  Mound,
  OnFace,
  Palm,
  Roof,
  Shadow,
  Tree,
  WASH_DARK,
  Win,
  type BoxShape,
} from '@/skins/travel/map/sprites/art-parts';

/** Hon Chong: two big granite boulders piled up, a smaller one beside, a palm and a patch of sand. */
export function TwinRocksArt() {
  return (
    <g>
      <Shadow rx={60} />
      <ellipse cx={80} cy={146} rx={64} ry={12} className='fill-tl-sand-2' />
      <ellipse cx={78} cy={145} rx={58} ry={9.5} className='fill-tl-sand' />
      <Palm x={134} y={141} s={0.95} lean={-1} />
      <Boulder x={58} y={147} rx={38} ry={34} />
      <Boulder x={74} y={118} rx={29} ry={26} />
      <Boulder x={116} y={149} rx={19} ry={14} />
      <Boulder x={28} y={150} rx={9} ry={5} />
      <path
        d='M64 100 q6 8 2 18 M44 130 q4 6 1 14 M112 140 q3 4 1 8'
        className='fill-none stroke-tl-soil-2'
        strokeOpacity={0.3}
        strokeWidth={1}
        strokeLinecap='round'
      />
    </g>
  );
}

/** A small pagoda with two curved tiled roofs. */
function Pagoda({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  const low: BoxShape = { cx: 0, y: 0, wl: 22, wr: 16, h: 11 };
  const up: BoxShape = { cx: -1, y: -17, wl: 14, wr: 10, h: 9 };
  const bigger = (b: BoxShape): BoxShape => ({
    cx: b.cx,
    y: b.y + 3,
    wl: b.wl + 6,
    wr: b.wr + 6,
    h: b.h + 3,
  });
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <Box shape={{ cx: 0, y: 3, wl: 26, wr: 20, h: 3 }} wall='fill-tl-stone' />
      <Box shape={low} wall='fill-tl-wall' />
      <OnFace shape={low} side='l' at={0.5}>
        <path
          d='M-3.5 0 v-6 a3.5 3.5 0 0 1 7 0 v6z'
          className='fill-tl-soil-2'
          opacity={0.75}
        />
        <rect x={-9.5} y={-8} width={4} height={5} className='fill-tl-glass' />
        <rect x={5.5} y={-8} width={4} height={5} className='fill-tl-glass' />
      </OnFace>
      <Roof shape={bigger(low)} roof='fill-tl-roof' rise={8} curve={3} />
      <Box shape={up} wall='fill-tl-wall' />
      <Roof shape={bigger(up)} roof='fill-tl-roof' rise={9} curve={3} />
      <path
        d='M-3 -43 v-8'
        className='stroke-tl-sun'
        strokeWidth={1.6}
        strokeLinecap='round'
      />
    </g>
  );
}

/** A seated Buddha (lotus pose) on a lotus seat: round head, a bun, a halo, folded legs. */
function Buddha({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={0} rx={22} ry={6} className='fill-tl-stone' />
      <ellipse cx={0} cy={-1.5} rx={19} ry={4.6} className='fill-tl-coral-2' />
      {[-15, -8, 0, 8, 15].map((px) => (
        <path
          key={px}
          d={`M${px - 4} -2 q4 -9 8 0z`}
          className='fill-tl-coral'
        />
      ))}
      <circle cx={0} cy={-39} r={13} className='fill-tl-sun' opacity={0.28} />
      <path
        d='M-21 -2 C-22 -12 -12 -16 0 -16 C12 -16 22 -12 21 -2 C11 3 -11 3 -21 -2z'
        className='fill-tl-wall'
      />
      <path
        d='M-10 -14 C-13 -22 -12 -29 -7 -32 C-3 -34 3 -34 7 -32 C12 -29 13 -22 10 -14z'
        className='fill-tl-wall'
      />
      <path
        d='M-8 -31 C-16 -24 -16 -14 -9 -9 C-6 -8 -3 -9 -2 -11 C-8 -14 -8 -22 -5 -29z'
        className='fill-tl-wall'
      />
      <path
        d='M8 -31 C16 -24 16 -14 9 -9 C6 -8 3 -9 2 -11 C8 -14 8 -22 5 -29z'
        className='fill-tl-wall'
      />
      <path
        d='M0 -34 C9 -34 13 -28 12 -20 C12 -15 10 -14 10 -14 L2 -14z M2 -16 C12 -15 21 -12 20 -3 C14 1 6 2 2 2z M8 -31 C16 -24 16 -14 9 -9 C6 -8 3 -9 2 -11 C8 -14 8 -22 5 -29z'
        className={WASH_DARK}
        opacity={0.2}
      />
      <path
        d='M-8 -30 C-13 -23 -13 -14 -8 -10 M8 -30 C13 -23 13 -14 8 -10 M-7 -32 q7 4 14 0'
        className='fill-none stroke-tl-soil-2'
        strokeOpacity={0.3}
        strokeWidth={0.8}
        strokeLinecap='round'
      />
      <ellipse cx={0} cy={-10} rx={5.4} ry={2.3} className='fill-tl-wall' />
      <ellipse
        cx={0}
        cy={-9.6}
        rx={5.4}
        ry={2.3}
        className='fill-none stroke-tl-soil-2'
        strokeOpacity={0.3}
        strokeWidth={0.8}
      />
      <circle cx={0} cy={-40} r={6.4} className='fill-tl-wall' />
      <path
        d='M0 -46.4 A6.4 6.4 0 0 1 0 -33.6 C3.4 -37 3.4 -43 0 -46.4z'
        className={WASH_DARK}
        opacity={0.2}
      />
      <circle cx={0} cy={-47.4} r={2.5} className='fill-tl-wall' />
      <path
        d='M-3.4 -40 q1.4 1 2.8 0 M0.6 -40 q1.4 1 2.8 0'
        className='fill-none stroke-tl-soil-2'
        strokeWidth={0.7}
        strokeLinecap='round'
        opacity={0.6}
      />
    </g>
  );
}

/** Long Son: a green hill with a big white seated Buddha on top and a pagoda at the foot, joined by steps. */
export function BuddhaPagodaArt() {
  return (
    <g>
      <Shadow rx={64} />
      <Mound x={84} y={149} w={140} h={84} />
      <Tree x={120} y={128} s={0.75} />
      <Tree x={136} y={142} s={0.8} />
      <Tree x={96} y={110} s={0.6} />
      <path
        d='M64 130 q14 -6 8 -18 q-8 -10 8 -20'
        className='fill-none stroke-tl-sand'
        strokeWidth={4.5}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <Buddha x={82} y={90} s={1.28} />
      <Pagoda x={48} y={142} />
      <Tree x={22} y={147} s={0.8} />
    </g>
  );
}

/** Bao Dai villas: a rocky green hill, a white villa with an orange roof on top, steps and a stone sea wall along the foot. */
export function VillaHillArt() {
  const villa: BoxShape = { cx: 84, y: 85, wl: 24, wr: 30, h: 14 };
  return (
    <g>
      <Shadow rx={64} />
      <Mound x={80} y={149} w={140} h={74} />
      <Boulder x={34} y={140} rx={14} ry={10} />
      <Boulder x={126} y={136} rx={12} ry={9} />
      <Boulder x={50} y={146} rx={9} ry={6} />
      <Tree x={112} y={118} s={0.8} />
      <Tree x={52} y={112} s={0.75} />
      <path
        d='M72 140 q10 -8 2 -16 q-8 -8 4 -16'
        className='fill-none stroke-tl-sand'
        strokeWidth={4}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <Box
        shape={{ cx: 84, y: 99, wl: 34, wr: 40, h: 9 }}
        wall='fill-tl-rock-2'
        top='fill-tl-stone'
      />
      <Box shape={villa} wall='fill-tl-wall' />
      <OnFace shape={villa} side='l' at={0.5}>
        <Win x={-6} y={-3} w={4} h={7} arch />
        <Win x={6} y={-3} w={4} h={7} arch />
      </OnFace>
      <OnFace shape={villa} side='r' at={0.5}>
        <Win x={-8} y={-4} w={4} h={7} arch />
        <Win x={8} y={-4} w={4} h={7} arch />
      </OnFace>
      <Roof
        shape={{ cx: 84, y: 87, wl: 28, wr: 34, h: 15 }}
        roof='fill-tl-brick'
        rise={12}
      />
      <path
        d='M14 147 Q80 164 146 147'
        className='fill-none stroke-tl-rock'
        strokeWidth={6}
        strokeLinecap='round'
      />
      <path
        d='M14 145 Q80 162 146 145'
        className='fill-none stroke-tl-rock-2'
        strokeWidth={3}
        strokeLinecap='round'
      />
      <path
        d='M14 145 Q80 162 146 145'
        className='fill-none stroke-tl-rock'
        strokeWidth={3}
        strokeDasharray='4 4'
        opacity={0.6}
      />
      <Palm x={142} y={146} s={0.8} lean={-1} />
    </g>
  );
}
