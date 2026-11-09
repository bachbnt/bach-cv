/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { BoatBody } from '@/skins/travel/map/sprites/boat-body';
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
  WASH_LIGHT,
  type BoxShape,
} from '@/skins/travel/map/sprites/art-parts';

/** Shallow water around an island: a foam halo, a turquoise disc and a dashed shoreline ring. */
export function Shallows({
  rx,
  ry,
  cy = 146,
  tone = 'fill-tl-sea-1',
}: {
  rx: number;
  ry: number;
  cy?: number;
  tone?: string;
}) {
  return (
    <g>
      <ellipse
        cx={80}
        cy={cy}
        rx={rx + 6}
        ry={ry + 2.5}
        className='fill-tl-foam'
        opacity={0.5}
      />
      <ellipse cx={80} cy={cy} rx={rx} ry={ry} className={tone} />
      <ellipse
        cx={80}
        cy={cy - 1.5}
        rx={rx}
        ry={ry}
        className='fill-none stroke-tl-foam'
        strokeWidth={1.3}
        strokeDasharray='6 5'
        opacity={0.7}
      />
    </g>
  );
}

/** A plank walkway on posts running down to the right (`dir` 1) or to the left (-1) at the isometric slope. */
export function Jetty({
  x,
  y,
  len,
  dir = 1,
  w = 4,
}: {
  x: number;
  y: number;
  len: number;
  dir?: 1 | -1;
  w?: number;
}) {
  const ax = dir * len;
  const ay = len / 2;
  const bx = -dir * w;
  const by = w / 2;
  const steps = Math.round(len / 5);
  const along = Array.from({ length: steps + 1 }, (_, i) => i / steps);
  const planks = along
    .slice(1, -1)
    .map((t) => `M${x + ax * t} ${y + ay * t}l${bx} ${by}`)
    .join('');
  const posts = along
    .filter((_, i) => i % 2 === 0)
    .map((t) => `M${x + bx + ax * t} ${y + by + ay * t + 2}v6`)
    .join('');
  return (
    <g>
      <path
        d={posts}
        className='fill-none stroke-tl-trunk'
        strokeWidth={1.6}
        strokeLinecap='round'
      />
      <path
        d={`M${x + bx} ${y + by}l${ax} ${ay}v2.4l${-ax} ${-ay}z`}
        className='fill-tl-trunk'
      />
      <path
        d={`M${x} ${y}l${ax} ${ay}l${bx} ${by}l${-ax} ${-ay}z`}
        className='fill-tl-soil'
      />
      <path
        d={planks}
        className='fill-none stroke-tl-soil-2'
        strokeOpacity={0.4}
        strokeWidth={0.8}
      />
    </g>
  );
}

/** A tiny boat seen from the front left: hull, white rail, cabin and a canopy. Stands on (x, y) at the waterline. */
export function Dinghy({
  x,
  y,
  s = 1,
  canopy = 'fill-tl-coral',
}: {
  x: number;
  y: number;
  s?: number;
  canopy?: string;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse
        cx={0}
        cy={5.4}
        rx={11}
        ry={2.4}
        className='fill-none stroke-tl-foam'
        strokeWidth={1}
        opacity={0.8}
      />
      <path d='M-9 0 H9 L6 5 Q0 6.6 -6 5z' className='fill-tl-hull' />
      <path d='M-9 0 H9 l-0.6 1.8 H-8.4z' className='fill-tl-foam' />
      <rect x={-3} y={-5} width={7} height={5} className='fill-tl-wall' />
      <rect
        x={-4.5}
        y={-7}
        width={10}
        height={2.4}
        rx={1.2}
        className={canopy}
      />
    </g>
  );
}

/** A little monkey sitting, in fur (`trunk`) with a sand face, a curled tail and a lit shoulder. */
function Monkey({
  x,
  y,
  flip = 1,
  s = 1,
}: {
  x: number;
  y: number;
  flip?: 1 | -1;
  s?: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip * s} ${s})`}>
      <path
        d='M5 0 q9 0 8 -9 q-1 -4 -4 -3'
        className='fill-none stroke-tl-trunk'
        strokeWidth={2}
        strokeLinecap='round'
      />
      <ellipse cx={0} cy={-5} rx={6} ry={6.4} className='fill-tl-trunk' />
      <ellipse cx={1.6} cy={-4} rx={3.6} ry={4.6} className='fill-tl-sand' />
      <ellipse
        cx={-1.8}
        cy={-7.4}
        rx={2.2}
        ry={3}
        className={WASH_LIGHT}
        opacity={0.25}
      />
      <circle cx={-0.5} cy={-13.4} r={4.3} className='fill-tl-trunk' />
      <circle cx={-4.2} cy={-14} r={1.7} className='fill-tl-trunk' />
      <ellipse cx={0.8} cy={-12.6} rx={3} ry={2.7} className='fill-tl-sand' />
      <circle cx={0.2} cy={-13.8} r={0.6} className='fill-tl-soil-2' />
      <circle cx={2.4} cy={-13.8} r={0.6} className='fill-tl-soil-2' />
      <ellipse cx={-4.5} cy={-4} rx={1.6} ry={4} className='fill-tl-trunk' />
      <ellipse cx={-3} cy={0.4} rx={3} ry={1.5} className='fill-tl-trunk' />
    </g>
  );
}

/** The little show stage of the island: a low hall with an open front, a tiled hip roof and a banner. */
function Stage({ x, y }: { x: number; y: number }) {
  const hall: BoxShape = { cx: 0, y: 0, wl: 12, wr: 10, h: 12 };
  return (
    <g transform={`translate(${x} ${y})`}>
      <Box shape={hall} wall='fill-tl-wall' />
      <OnFace shape={hall} side='l' at={0.5}>
        <rect
          x={-7}
          y={-9}
          width={14}
          height={9}
          className='fill-tl-soil-2'
          opacity={0.9}
        />
        <path d='M-7 -9 H7 V-7.4 H-7z' className='fill-tl-coral' />
      </OnFace>
      <Roof
        shape={{ cx: 0, y: 0, wl: 14, wr: 12, h: 12 }}
        roof='fill-tl-roof'
        rise={6}
      />
      <path
        d='M0 -21 V-29'
        className='stroke-tl-soil-2'
        strokeWidth={1.1}
        strokeLinecap='round'
      />
      <path d='M0 -29 l6 1.8 l-6 2.2z' className='fill-tl-sun' />
    </g>
  );
}

/** Monkey Island: a forested island with a granite outcrop, a troop of macaques with a baby, a small pier and a stage. */
export function IslandMonkeyArt() {
  return (
    <g>
      <Shadow rx={62} ry={11} />
      <Shallows rx={70} ry={15.5} />
      <ellipse
        cx={78}
        cy={146.5}
        rx={60}
        ry={12.5}
        className='fill-tl-sand-2'
      />
      <ellipse cx={78} cy={145} rx={56} ry={10.5} className='fill-tl-sand' />
      <Mound x={70} y={141} w={110} h={46} />
      <Tree x={102} y={118} s={0.8} />
      <Tree x={34} y={128} s={0.75} />
      <Palm x={22} y={146} s={1.05} lean={-1} />
      <Boulder x={58} y={143} rx={26} ry={21} />
      <Boulder x={66} y={118} rx={17} ry={15} />
      <Boulder x={36} y={147} rx={9} ry={6} />
      <path
        d='M52 124 q4 8 1 17 M70 108 q-3 6 0 12'
        className='fill-none stroke-tl-soil-2'
        strokeOpacity={0.3}
        strokeWidth={1}
        strokeLinecap='round'
      />
      <Monkey x={58} y={106} />
      <Monkey x={72} y={106} flip={-1} s={0.85} />
      <Monkey x={64} y={124} s={0.9} />
      <Monkey x={77} y={127} flip={-1} s={0.5} />
      <Stage x={112} y={143} />
      <Jetty x={122} y={144} len={16} />
      <Dinghy x={150} y={148} s={0.85} canopy='fill-tl-sun' />
    </g>
  );
}

/** A piece of coral: a few rounded branches. */
function Coral({ x, y, tone }: { x: number; y: number; tone: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(1.05)`}>
      <path
        d='M0 0 V-8 M0 -4 q-4 -2 -5 -7 M0 -6 q4 -2 5 -8 M-5 -11 v-2 M5 -14 v-2 M0 -8 v-6'
        className={`fill-none ${tone}`}
        strokeWidth={2.6}
        strokeLinecap='round'
      />
    </g>
  );
}

/** A round brain coral with a groove across it. */
function BrainCoral({ x, y, tone }: { x: number; y: number; tone: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={0} cy={0} rx={6.5} ry={4} className={tone} />
      <path
        d='M-4 -1 q2 -2 4 0 t4 0 M-3 1.4 q2 -1.6 3.4 0 t3 -0.2'
        className='fill-none stroke-tl-soil-2'
        strokeOpacity={0.35}
        strokeWidth={0.8}
        strokeLinecap='round'
      />
    </g>
  );
}

/** A small reef fish with a tail fin. */
function Fish({
  x,
  y,
  tone,
  flip = 1,
}: {
  x: number;
  y: number;
  tone: string;
  flip?: 1 | -1;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip} 1)`} className={tone}>
      <ellipse cx={0} cy={0} rx={3.6} ry={2} />
      <path d='M-3 0 L-6.4 -2.2 V2.2z' />
    </g>
  );
}

/**
 * Hon Mun: the marine reserve. A tall dark-green hill with a rock foot, turquoise reef water with corals and fish under the surface,
 * a buoy line and a dive boat with a dive flag and bubbles.
 */
export function IslandDiveArt() {
  const hill =
    'M-52 0 C-56 -22 -46 -40 -30 -52 C-20 -60 -12 -76 2 -80 C14 -82 20 -66 32 -56 C46 -46 54 -24 52 0 Q0 12 -52 0z';
  return (
    <g>
      <Shadow rx={62} ry={11} />
      <Shallows rx={70} ry={16} tone='fill-tl-sea-2' />
      <ellipse cx={80} cy={148} rx={60} ry={12} className='fill-tl-sea-1' />
      <g transform='translate(68 133) scale(0.82)'>
        <path d={hill} className='fill-tl-leaf' />
        <path
          d={hill}
          className='fill-tl-hill-w'
          transform='translate(-4 -3) scale(0.9 0.9)'
        />
        <path
          d='M2 -80 C14 -82 20 -66 32 -56 C46 -46 54 -24 52 0 Q30 9 10 8 C16 -30 10 -62 2 -80z'
          className={WASH_DARK}
          opacity={0.3}
        />
        <path
          d='M-30 -50 C-18 -56 -12 -72 0 -76 M2 -78 C14 -74 20 -62 30 -54'
          className='fill-none stroke-tl-hill-t'
          strokeWidth={2.2}
          strokeLinecap='round'
          opacity={0.7}
        />
      </g>
      <Tree x={50} y={108} s={0.55} />
      <Tree x={80} y={100} s={0.6} />
      <Tree x={94} y={120} s={0.65} />
      <Tree x={38} y={124} s={0.6} />
      <Boulder x={28} y={137} rx={13} ry={12} />
      <Boulder x={46} y={141} rx={8} ry={5} />
      <Boulder x={106} y={138} rx={9} ry={8} />
      <ellipse
        cx={80}
        cy={153}
        rx={54}
        ry={7}
        className={WASH_LIGHT}
        opacity={0.18}
      />
      <Coral x={22} y={150} tone='stroke-tl-coral' />
      <BrainCoral x={38} y={154} tone='fill-tl-sun' />
      <Coral x={52} y={156} tone='stroke-tl-teal' />
      <BrainCoral x={64} y={146} tone='fill-tl-stop-5' />
      <Coral x={80} y={146} tone='stroke-tl-sun' />
      <BrainCoral x={96} y={158} tone='fill-tl-coral-2' />
      <Coral x={112} y={156} tone='stroke-tl-sun' />
      <Coral x={132} y={156} tone='stroke-tl-coral' />
      <BrainCoral x={142} y={148} tone='fill-tl-coral' />
      <Fish x={62} y={150} tone='fill-tl-sun' />
      <Fish x={122} y={150} tone='fill-tl-stop-1' flip={-1} />
      <Fish x={30} y={142} tone='fill-tl-coral' flip={-1} />
      <path
        d='M14 141 Q70 166 148 147'
        className='fill-none stroke-tl-foam'
        strokeWidth={0.9}
        strokeDasharray='2 3'
        opacity={0.8}
      />
      {[
        [14, 141],
        [76, 156],
        [148, 147],
      ].map(([bx, by]) => (
        <g key={bx}>
          <circle cx={bx} cy={by} r={2.8} className='fill-tl-coral' />
          <path
            d={`M${bx - 2.8} ${by} h5.6`}
            className='stroke-tl-foam'
            strokeWidth={1}
          />
        </g>
      ))}
      <g transform='translate(94 126) scale(0.66)'>
        <g className='tl-dive'>
          <BoatBody dive />
        </g>
      </g>
      {[0, 1, 2].map((i) => (
        <circle
          key={i}
          cx={88 + i * 5}
          cy={156 - i * 4}
          r={2.2 - i * 0.4}
          className={`tl-bubble tl-bubble-${i} fill-none stroke-tl-foam`}
          strokeWidth={1}
        />
      ))}
    </g>
  );
}
