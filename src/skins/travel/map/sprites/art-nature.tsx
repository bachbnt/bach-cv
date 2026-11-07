/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import {
  Boulder,
  Cylinder,
  Mound,
  Palm,
  Shadow,
  Tree,
  WASH_DARK,
} from '@/skins/travel/map/sprites/art-parts';

/** A round pool with a stone rim; `water` is a `fill-tl-*` class. */
function Pool({
  x,
  y,
  rx,
  water,
  dots = false,
}: {
  x: number;
  y: number;
  rx: number;
  water: string;
  dots?: boolean;
}) {
  const ry = rx * 0.48;
  return (
    <g>
      <ellipse
        cx={x}
        cy={y + 2.5}
        rx={rx + 3}
        ry={ry + 2}
        className='fill-tl-rock'
      />
      <ellipse
        cx={x}
        cy={y}
        rx={rx + 3}
        ry={ry + 2}
        className='fill-tl-rock-2'
      />
      <ellipse cx={x} cy={y + 0.8} rx={rx} ry={ry} className={water} />
      <ellipse
        cx={x + rx * 0.2}
        cy={y + ry * 0.35}
        rx={rx * 0.72}
        ry={ry * 0.6}
        className={WASH_DARK}
        opacity={0.14}
      />
      <path
        d={`M${x - rx * 0.6} ${y - ry * 0.2} q${rx * 0.25} ${-ry * 0.45} ${rx * 0.6} ${-ry * 0.35}`}
        className='fill-none stroke-tl-foam'
        strokeWidth={1.4}
        strokeLinecap='round'
        opacity={0.55}
      />
      {dots && (
        <g className='fill-tl-soil-2' opacity={0.4}>
          <circle cx={x - rx * 0.3} cy={y + ry * 0.3} r={1.4} />
          <circle cx={x + rx * 0.35} cy={y + ry * 0.1} r={1.1} />
          <circle cx={x + rx * 0.05} cy={y + ry * 0.5} r={0.9} />
        </g>
      )}
    </g>
  );
}

/** A curl of steam that rises and fades (`tl-steam`, see css/sprites.css). */
function Steam({ x, y, delay }: { x: number; y: number; delay: 0 | 1 | 2 }) {
  return (
    <path
      d={`M${x} ${y} q-6 -8 0 -15 q6 -7 0 -15`}
      className={`tl-steam tl-steam-${delay} fill-none stroke-tl-foam`}
      strokeWidth={3}
      strokeLinecap='round'
    />
  );
}

/** Thap Ba hot springs: three round pools (mud, hot water, a cool one), steam curls and a thatched hut. */
export function HotSpringArt() {
  return (
    <g>
      <Shadow rx={62} />
      <ellipse cx={80} cy={145} rx={66} ry={16} className='fill-tl-sand-2' />
      <ellipse cx={80} cy={143} rx={61} ry={13.5} className='fill-tl-sand' />
      <Pool x={50} y={140} rx={24} water='fill-tl-soil' dots />
      <Pool x={102} y={142} rx={20} water='fill-tl-teal' />
      <Pool x={78} y={128} rx={15} water='fill-tl-glass' />
      <Steam x={50} y={134} delay={0} />
      <Steam x={102} y={136} delay={1} />
      <Steam x={78} y={122} delay={2} />
      <g>
        <rect
          x={125}
          y={118}
          width={2.4}
          height={20}
          className='fill-tl-trunk'
        />
        <rect
          x={142}
          y={120}
          width={2.4}
          height={20}
          className='fill-tl-trunk'
        />
        <Cylinder cx={134} y={138} r={11} h={11} wall='fill-tl-wall' />
        <path
          d='M134 112 L150 129 Q134 135 118 129z'
          className='fill-tl-soil'
        />
        <path
          d='M134 112 L150 129 Q142 132 134 133z'
          className={WASH_DARK}
          opacity={0.25}
        />
        <path
          d='M126 124 l-3 6 M134 121 v10 M142 124 l3 6'
          className='fill-none stroke-tl-wall'
          strokeWidth={0.9}
          opacity={0.5}
        />
        <path
          d='M130 138 v-7 a4 4 0 0 1 8 0 v7z'
          className='fill-tl-soil-2'
          opacity={0.8}
        />
      </g>
      <Palm x={18} y={140} s={0.85} />
      <Boulder x={90} y={151} rx={8} ry={5} />
    </g>
  );
}

/** Ba Ho falls: a rocky cliff with three tiers of white falling water, each ending in a pool, with trees around. */
export function WaterfallArt() {
  const cliff =
    'M-52 0 C-54 -28 -46 -58 -36 -78 C-28 -98 -14 -116 6 -122 C28 -126 42 -108 48 -84 C56 -56 58 -28 54 0z';
  return (
    <g>
      <Shadow rx={64} />
      <g transform='translate(80 148)'>
        <path d={cliff} className='fill-tl-rock' />
        <path
          d={cliff}
          className='fill-tl-rock-2'
          transform='translate(-5 -3) scale(0.9 0.95)'
        />
        <path
          d='M-30 -78 C-18 -112 24 -122 40 -94 C20 -100 -6 -96 -30 -78z'
          className='fill-tl-leaf'
        />
        <path
          d='M-34 -60 q16 -8 30 -2 M16 -52 q14 -10 30 -4 M-28 -26 q14 -8 26 -2'
          className='fill-none stroke-tl-rock'
          strokeWidth={3}
          strokeLinecap='round'
          opacity={0.7}
        />
        <ellipse cx={4} cy={-98} rx={20} ry={5} className='fill-tl-park' />
        <path
          className='fill-tl-foam'
          d='M-5 -98 L-7 -68 Q3 -62 13 -68 L12 -98z'
        />
        <path
          className='tl-fall fill-none stroke-tl-teal'
          d='M-1 -96 v26 M5 -96 v28 M10 -96 v26'
          strokeWidth={1.2}
          strokeLinecap='round'
        />
        <ellipse cx={3} cy={-66} rx={27} ry={7} className='fill-tl-river' />
        <ellipse
          cx={3}
          cy={-67}
          rx={19}
          ry={4.5}
          className='fill-tl-foam'
          opacity={0.6}
        />
        <path
          className='fill-tl-foam'
          d='M-12 -64 L-17 -36 Q6 -28 26 -36 L21 -64z'
        />
        <path
          className='tl-fall fill-none stroke-tl-teal'
          d='M-7 -62 v26 M2 -62 v28 M10 -62 v28 M17 -62 v26'
          strokeWidth={1.2}
          strokeLinecap='round'
        />
        <ellipse cx={4} cy={-32} rx={34} ry={9} className='fill-tl-river' />
        <ellipse
          cx={4}
          cy={-33}
          rx={24}
          ry={5.5}
          className='fill-tl-foam'
          opacity={0.6}
        />
        <path
          className='fill-tl-foam'
          d='M-18 -28 L-24 -4 Q4 6 32 -4 L26 -28z'
        />
        <path
          className='tl-fall fill-none stroke-tl-teal'
          d='M-12 -26 v22 M-2 -26 v26 M8 -26 v26 M18 -26 v24'
          strokeWidth={1.2}
          strokeLinecap='round'
        />
        <ellipse cx={4} cy={0} rx={44} ry={11} className='fill-tl-river' />
        <ellipse
          cx={4}
          cy={-1}
          rx={32}
          ry={7}
          className='fill-tl-foam'
          opacity={0.55}
        />
      </g>
      <Tree x={22} y={140} s={1.1} />
      <Tree x={36} y={148} s={0.8} />
      <Tree x={134} y={138} s={1.1} />
      <Palm x={146} y={148} s={0.85} lean={-1} />
      <Boulder x={110} y={151} rx={9} ry={6} />
      <Mound x={44} y={150} w={36} h={8} />
    </g>
  );
}
