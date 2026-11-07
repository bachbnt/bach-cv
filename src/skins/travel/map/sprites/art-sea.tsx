/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { BoatBody } from '@/skins/travel/map/sprites/boat-body';
import {
  Boulder,
  Mound,
  Palm,
  Shadow,
  Tree,
  WASH_DARK,
  WASH_LIGHT,
} from '@/skins/travel/map/sprites/art-parts';

/** A sand rim and a green hill: the base of the small islands. */
function Islet({ w = 112, h = 40 }: { w?: number; h?: number }) {
  return (
    <g>
      <ellipse
        cx={80}
        cy={147}
        rx={w / 2 + 6}
        ry={14}
        className='fill-tl-foam'
        opacity={0.55}
      />
      <ellipse
        cx={80}
        cy={146}
        rx={w / 2 + 2}
        ry={12}
        className='fill-tl-sand-2'
      />
      <ellipse
        cx={80}
        cy={144}
        rx={w / 2 - 2}
        ry={10.5}
        className='fill-tl-sand'
      />
      <Mound x={80} y={143} w={w - 18} h={h} />
    </g>
  );
}

/** A small round green island with a sand rim, a palm and a tiny boat. */
export function IslandArt() {
  return (
    <g>
      <Shadow rx={56} ry={10} />
      <Islet />
      <Tree x={58} y={130} s={0.8} />
      <Palm x={92} y={134} s={1.15} />
      <Boulder x={110} y={146} rx={7} ry={4.5} />
      <g transform='translate(102 138) scale(0.5)'>
        <BoatBody wake={false} flag='fill-tl-sun' />
      </g>
    </g>
  );
}

/** A little monkey sitting, in fur (`trunk`) with a sand face and a curled tail. */
function Monkey({ x, y, flip = 1 }: { x: number; y: number; flip?: 1 | -1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip} 1)`}>
      <path
        d='M5 0 q9 0 8 -9 q-1 -4 -4 -3'
        className='fill-none stroke-tl-trunk'
        strokeWidth={2}
        strokeLinecap='round'
      />
      <ellipse cx={0} cy={-5} rx={6} ry={6.4} className='fill-tl-trunk' />
      <ellipse cx={1.6} cy={-4} rx={3.6} ry={4.6} className='fill-tl-sand' />
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

/** Monkey Island: an island with a palm and two little monkeys sitting on a rock. */
export function IslandMonkeyArt() {
  return (
    <g>
      <Shadow rx={56} ry={10} />
      <Islet />
      <Palm x={50} y={134} s={1.1} lean={-1} />
      <Tree x={114} y={134} s={0.75} />
      <Boulder x={88} y={140} rx={20} ry={14} />
      <Monkey x={82} y={124} />
      <Monkey x={96} y={126} flip={-1} />
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

/** Hon Mun: a rocky dark-green island with a coral rim in the shallows, and a dive boat with a flag and bubbles. */
export function IslandDiveArt() {
  const blob =
    'M-50 0 C-54 -22 -38 -38 -20 -46 C-6 -56 14 -58 28 -46 C46 -36 54 -18 50 0 Q0 12 -50 0z';
  return (
    <g>
      <Shadow rx={60} ry={11} />
      <ellipse
        cx={80}
        cy={146}
        rx={72}
        ry={17}
        className='fill-tl-foam'
        opacity={0.5}
      />
      <ellipse cx={80} cy={146} rx={66} ry={14} className='fill-tl-sea-1' />
      <ellipse
        cx={80}
        cy={144}
        rx={66}
        ry={14}
        className='fill-none stroke-tl-foam'
        strokeWidth={1.4}
        strokeDasharray='6 5'
        opacity={0.7}
      />
      <g transform='translate(76 145)'>
        <path d={blob} className='fill-tl-leaf' />
        <path
          d={blob}
          className='fill-tl-hill-w'
          transform='translate(-4 -3) scale(0.9 0.88)'
        />
        <path
          d={blob}
          className={WASH_DARK}
          opacity={0.2}
          transform='translate(14 -2) scale(0.7 0.8)'
        />
      </g>
      <Coral x={22} y={148} tone='stroke-tl-coral' />
      <Coral x={34} y={154} tone='stroke-tl-sun' />
      <Coral x={16} y={141} tone='stroke-tl-coral-2' />
      <Coral x={48} y={157} tone='stroke-tl-teal' />
      <Coral x={64} y={157} tone='stroke-tl-coral' />
      <Coral x={140} y={150} tone='stroke-tl-sun' />
      <Boulder
        x={46}
        y={140}
        rx={14}
        ry={14}
        lit='fill-tl-rock-2'
        dark='fill-tl-rock'
      />
      <Boulder x={72} y={118} rx={13} ry={11} />
      <Boulder x={108} y={140} rx={10} ry={9} />
      <Tree x={84} y={112} s={0.7} />
      <Tree x={96} y={124} s={0.8} />
      <Tree x={62} y={124} s={0.65} />
      <g transform='translate(88 128) scale(0.72)'>
        <g className='tl-dive'>
          <BoatBody dive />
        </g>
      </g>
      {[0, 1, 2].map((i) => (
        <circle
          key={i}
          cx={96 + i * 6}
          cy={150}
          r={2.2 - i * 0.4}
          className={`tl-bubble tl-bubble-${i} fill-none stroke-tl-foam`}
          strokeWidth={1}
        />
      ))}
      <ellipse
        cx={74}
        cy={116}
        rx={14}
        ry={4}
        className={WASH_LIGHT}
        opacity={0.12}
      />
    </g>
  );
}
