/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { SeatedBuddha } from '@/skins/travel/map/sprites/art-hills-buddha';
import { PagodaGate } from '@/skins/travel/map/sprites/art-hills-gate';
import { Granite } from '@/skins/travel/map/sprites/art-hills-granite';
import { PagodaHall } from '@/skins/travel/map/sprites/art-hills-hall';
import { Pine } from '@/skins/travel/map/sprites/art-hills-pine';
import { RecliningBuddha } from '@/skins/travel/map/sprites/art-hills-reclining';
import { SlopeHill } from '@/skins/travel/map/sprites/art-hills-slope';
import { Villa } from '@/skins/travel/map/sprites/art-hills-villa';
import {
  Box,
  Palm,
  Shadow,
  topCorners,
  Tree,
  WASH_DARK,
  type BoxShape,
} from '@/skins/travel/map/sprites/art-parts';

/** Hon Chong: a headland of granite boulders stacked on the shore, one balanced on top with the giant hand print, a small stack beside, foam and a beach. */
export function TwinRocksArt() {
  return (
    <g>
      <Shadow rx={62} />
      <ellipse cx={36} cy={148} rx={36} ry={8.5} className='fill-tl-sea-2' />
      <ellipse cx={36} cy={148} rx={30} ry={6} className='fill-tl-sea-1' />
      <ellipse cx={100} cy={147} rx={58} ry={10} className='fill-tl-sand-2' />
      <ellipse cx={98} cy={146} rx={52} ry={8} className='fill-tl-sand' />
      <path
        d='M70 140 C74 118 108 108 130 122 C146 130 150 140 142 146 Q110 150 70 146z'
        className='fill-tl-hill-w'
      />
      <path
        d='M76 138 C82 122 108 114 126 124 C112 122 94 128 84 142z'
        className='fill-tl-hill-s'
      />
      <ellipse cx={116} cy={125} rx={7} ry={4.4} className='fill-tl-leaf' />
      <ellipse cx={132} cy={133} rx={6} ry={3.8} className='fill-tl-leaf' />
      <Granite x={114} y={142} rx={22} ry={14} lichen grounded />
      <Granite x={134} y={149} rx={11} ry={12} grounded />
      <Granite x={134} y={132} rx={7} ry={4} turn={8} />
      <Granite x={44} y={149} rx={31} ry={22} lichen grounded />
      <Granite x={90} y={149} rx={28} ry={21} grounded />
      <Granite x={64} y={122} rx={25} ry={20} />
      <g transform='translate(55 114) rotate(-6) scale(0.82)'>
        <ellipse
          cx={0}
          cy={0}
          rx={4.6}
          ry={5}
          className={WASH_DARK}
          opacity={0.34}
        />
        <path
          d='M-3.4 -3 L-4.4 -12 M-1.2 -4 L-1.6 -14 M1.2 -4 L1.8 -13.4 M3.4 -3 L5 -10.6 M-4.2 1 L-9 -4'
          className='fill-none stroke-tl-soil-2'
          strokeOpacity={0.34}
          strokeWidth={1.9}
          strokeLinecap='round'
        />
      </g>
      <Granite x={62} y={92} rx={21} ry={16} turn={-9} lichen />
      <Granite x={94} y={113} rx={13} ry={9} turn={6} />
      <path
        d='M100 148 q6 -5 11 -11 q4 -5 9 -7'
        className='fill-none stroke-tl-stone'
        strokeWidth={4}
        strokeDasharray='2.4 1.8'
      />
      <Granite x={20} y={149} rx={10} ry={6} grounded />
      <path
        d='M6 148 q5 -3 10 0 t10 0 M22 152 q6 -3 12 0 t12 0 M60 152 q8 -3 14 0'
        className='fill-none stroke-tl-foam'
        strokeWidth={1.3}
        strokeLinecap='round'
        opacity={0.9}
      />
      <ellipse cx={30} cy={128} rx={6} ry={3.4} className='fill-tl-leaf' />
      <Palm x={31} y={129} s={0.5} lean={1} />
      <Palm x={146} y={146} s={0.85} lean={-1} />
    </g>
  );
}

/** The long white stair: it narrows toward the top, with a dragon along each side whose head sits at the foot. */
function DragonStair({ top, bottom }: { top: number; bottom: number }) {
  const half = (y: number) => 7 + (y - top) * 0.13;
  const rows = Array.from(
    { length: Math.floor((bottom - top) / 4.5) },
    (_, i) => bottom - 3 - i * 4.5,
  );
  const side = (sign: 1 | -1) =>
    `M${80 + sign * half(bottom)} ${bottom} L${80 + sign * half(top)} ${top}`;
  return (
    <g>
      <path
        d={`M${80 - half(bottom)} ${bottom} L${80 + half(bottom)} ${bottom} L${80 + half(top)} ${top} L${80 - half(top)} ${top}z`}
        className='fill-tl-wall'
      />
      <path
        d={rows.map((y) => `M${80 - half(y)} ${y} h${2 * half(y)}`).join(' ')}
        className='fill-none stroke-tl-soil-2'
        strokeOpacity={0.22}
        strokeWidth={0.7}
      />
      {([-1, 1] as const).map((sign) => (
        <g key={sign}>
          <path
            d={side(sign)}
            className='fill-none stroke-tl-stone'
            strokeWidth={3.6}
            strokeLinecap='round'
          />
          <path
            d={side(sign)}
            className='fill-none stroke-tl-wall'
            strokeWidth={2.2}
            strokeLinecap='round'
            strokeDasharray='3 1.4'
          />
          <ellipse
            cx={80 + sign * (half(bottom) + 0.5)}
            cy={bottom + 0.5}
            rx={3.4}
            ry={2.4}
            className='fill-tl-wall'
          />
          <circle
            cx={80 + sign * (half(bottom) + 1.4)}
            cy={bottom - 0.2}
            r={0.7}
            className='fill-tl-coral'
          />
        </g>
      ))}
    </g>
  );
}

/** Long Son: a hill with the big white seated Buddha on a round terrace, a dragon stair, a reclining Buddha, the pagoda hall and its gate. */
export function BuddhaPagodaArt() {
  return (
    <g>
      <Shadow rx={66} />
      <SlopeHill x={80} y={149} w={148} h={92} bands={[0.2, 0.42]} />
      <Tree x={24} y={138} s={0.7} />
      <Tree x={128} y={108} s={0.6} />
      <ellipse cx={80} cy={90} rx={29} ry={8} className='fill-tl-stone' />
      <ellipse cx={80} cy={88.5} rx={29} ry={8} className='fill-tl-wall' />
      <ellipse
        cx={80}
        cy={88.5}
        rx={26}
        ry={6.8}
        className='fill-none stroke-tl-stone'
        strokeWidth={1.6}
        strokeDasharray='1.2 1.6'
      />
      <DragonStair top={92} bottom={138} />
      <RecliningBuddha x={44} y={128} />
      <SeatedBuddha x={80} y={88} s={0.92} />
      <ellipse cx={80} cy={146} rx={34} ry={7} className='fill-tl-walk' />
      <PagodaHall x={126} y={147} s={0.78} />
      <PagodaGate x={83} y={150} />
    </g>
  );
}

/** A stone terrace the villa stands on: a rock wall with joints, a pale top and a balustrade along the two front edges. */
function Terrace({ shape }: { shape: BoxShape }) {
  const t = topCorners(shape);
  const rail = `M${t.a} L${t.b} L${t.c}`;
  return (
    <g>
      <Box shape={shape} wall='fill-tl-rock-2' top='fill-tl-stone' />
      <path
        d={`M${shape.cx - shape.wl} ${shape.y - shape.h / 2 - shape.wl / 2} L${shape.cx} ${shape.y - shape.h / 2} L${shape.cx + shape.wr} ${shape.y - shape.h / 2 - shape.wr / 2}`}
        className='fill-none stroke-tl-soil-2'
        strokeOpacity={0.25}
        strokeWidth={0.7}
      />
      <path
        d={rail}
        className='fill-none stroke-tl-rock'
        strokeWidth={2.6}
        strokeLinejoin='round'
        opacity={0.5}
      />
      <path
        d={rail}
        className='fill-none stroke-tl-wall'
        strokeWidth={1.8}
        strokeLinejoin='round'
        strokeDasharray='1.2 1.2'
      />
    </g>
  );
}

/** Bao Dai villas: two ivory colonial villas with red-tile roofs on terraces of a green hill above the sea, a winding road with a low wall, pines and a palm. */
export function VillaHillArt() {
  const upper: BoxShape = { cx: 78, y: 104, wl: 34, wr: 40, h: 10 };
  const lower: BoxShape = { cx: 118, y: 136, wl: 20, wr: 24, h: 7 };
  const road = 'M26 148 q30 -2 30 -12 q0 -9 18 -10 q8 -1 5 -9';
  return (
    <g>
      <Shadow rx={68} />
      <SlopeHill x={80} y={149} w={156} h={120} bands={[0.28, 0.5]} />
      <Pine x={22} y={120} s={0.85} />
      <Pine x={138} y={112} s={0.75} />
      <Palm x={46} y={112} s={0.62} lean={1} />
      <path
        d={road}
        className='fill-none stroke-tl-rock'
        strokeWidth={6.6}
        strokeLinecap='round'
        opacity={0.85}
      />
      <path
        d={road}
        className='fill-none stroke-tl-walk'
        strokeWidth={4}
        strokeLinecap='round'
      />
      <path
        d='M79 124 L79 106'
        className='fill-none stroke-tl-stone'
        strokeWidth={7}
        strokeDasharray='1.8 1.6'
      />
      <Terrace shape={upper} />
      <Villa x={78} y={94} s={0.9} />
      <Terrace shape={lower} />
      <Villa x={118} y={129} s={0.56} />
      <Granite x={24} y={150} rx={12} ry={7} grounded />
      <Granite x={144} y={151} rx={10} ry={6} grounded />
    </g>
  );
}
