/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import {
  Box,
  Mound,
  OnFace,
  Palm,
  Roof,
  Shadow,
  Tree,
  Win,
  type BoxShape,
} from '@/skins/travel/map/sprites/art-parts';
import { Jetty } from '@/skins/travel/map/sprites/art-sea-jetty';
import { Shallows } from '@/skins/travel/map/sprites/art-sea-shallows';

/** A bungalow on stilts: posts, a plank deck, a small hip-roofed house with a door and a window. `roof` is a `fill-tl-*` class. */
function Bungalow({
  x,
  y,
  roof,
  stilts = 6,
}: {
  x: number;
  y: number;
  roof: string;
  stilts?: number;
}) {
  const house: BoxShape = { cx: 0, y: -3, wl: 9, wr: 8, h: 7 };
  const eaves: BoxShape = { cx: 0, y: -2, wl: 11, wr: 10, h: 7 };
  return (
    <g transform={`translate(${x} ${y})`}>
      <path
        d={`M-8 -1 v${stilts} M-1 3 v${stilts} M7 -1 v${stilts}`}
        className='fill-none stroke-tl-trunk'
        strokeWidth={1.6}
        strokeLinecap='round'
      />
      <Box
        shape={{ cx: 0, y: 1, wl: 12, wr: 11, h: 2 }}
        wall='fill-tl-soil'
        top='fill-tl-soil'
      />
      <Box shape={house} wall='fill-tl-wall' />
      <OnFace shape={house} side='l' at={0.5}>
        <Win x={-3.4} y={-2} w={3} h={4.4} />
        <rect
          x={1.2}
          y={-5.4}
          width={3}
          height={5.4}
          className='fill-tl-soil-2'
        />
      </OnFace>
      <Roof shape={eaves} roof={roof} rise={6} />
    </g>
  );
}

/** A beach umbrella with two stripes on a pole, and a lounger under it. */
function Umbrella({ x, y, tone }: { x: number; y: number; tone: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path
        d='M-7 0 l7 3.5 l5 -2.5 l-7 -3.5z'
        className='fill-tl-foam'
        opacity={0.9}
      />
      <path
        d='M0 3 V-9'
        className='stroke-tl-trunk'
        strokeWidth={1}
        strokeLinecap='round'
      />
      <path d='M-7 -8 Q0 -16 7 -8 Q0 -10 -7 -8z' className={tone} />
      <path
        d='M-2.4 -9.6 Q0 -13 2.4 -9.6 Q0 -10 -2.4 -9.6z'
        className='fill-tl-foam'
      />
    </g>
  );
}

/**
 * Hon Tam: the resort island. A crescent of white sand around a calm lagoon, a low green hill behind, bungalows on the sand and on
 * stilts over the water joined by a wooden jetty, beach umbrellas and palms.
 */
export function HonTamArt() {
  return (
    <g>
      <Shadow rx={62} ry={11} />
      <Shallows rx={72} ry={16} />
      <ellipse cx={80} cy={141} rx={62} ry={13} className='fill-tl-sand-2' />
      <ellipse cx={80} cy={139.5} rx={58} ry={11} className='fill-tl-sand' />
      <Mound x={74} y={132} w={92} h={36} />
      <Tree x={50} y={122} s={0.7} />
      <Tree x={96} y={118} s={0.65} />
      <ellipse cx={88} cy={149} rx={46} ry={10.5} className='fill-tl-sea-1' />
      <ellipse
        cx={88}
        cy={148}
        rx={46}
        ry={10.5}
        className='fill-none stroke-tl-foam'
        strokeWidth={1}
        opacity={0.5}
      />
      <Palm x={24} y={142} s={1} lean={-1} />
      <Palm x={132} y={140} s={0.9} lean={-1} />
      <Bungalow x={38} y={139} roof='fill-tl-soil' stilts={2} />
      <Umbrella x={58} y={141} tone='fill-tl-coral' />
      <Umbrella x={112} y={139} tone='fill-tl-sun' />
      <Jetty x={72} y={141} len={28} />
      <Bungalow x={62} y={152} roof='fill-tl-soil' />
      <Bungalow x={112} y={152} roof='fill-tl-roof' />
    </g>
  );
}
