/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import {
  Box,
  Boulder,
  Palm,
  Roof,
  Shadow,
  WASH_DARK,
  type BoxShape,
} from '@/skins/travel/map/sprites/art-parts';
import { Bamboo } from '@/skins/travel/map/sprites/art-nature-bamboo';
import { RopeBridge } from '@/skins/travel/map/sprites/art-nature-bridge';
import { Crown } from '@/skins/travel/map/sprites/art-nature-crown';
import { Tier } from '@/skins/travel/map/sprites/art-nature-tier';
import { Fern } from '@/skins/travel/map/sprites/art-nature-fern';
import { Lounger } from '@/skins/travel/map/sprites/art-nature-lounger';
import { MudPool } from '@/skins/travel/map/sprites/art-nature-mud-pool';
import { ThatchPavilion } from '@/skins/travel/map/sprites/art-nature-pavilion';
import { SpringPool } from '@/skins/travel/map/sprites/art-nature-spring-pool';
import { MudTub } from '@/skins/travel/map/sprites/art-nature-tub';
import { Steam } from '@/skins/travel/map/sprites/art-nature-steam';

/** Thap Ba hot springs: a lawn with a mud bath, a mineral pool in a plank deck, a thatched pavilion on stilts, a bathing hut and a parasol. */
export function HotSpringArt() {
  const hut: BoxShape = { cx: 34, y: 100, wl: 9, wr: 9, h: 11 };
  return (
    <g>
      <defs>
        <linearGradient id='tl-spring-water' x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0' style={{ stopColor: 'var(--tl-glass)' }} />
          <stop offset='1' style={{ stopColor: 'var(--tl-teal)' }} />
        </linearGradient>
      </defs>
      <Shadow rx={68} ry={14} cy={145} />
      <ellipse cx={80} cy={119} rx={69} ry={31} className='fill-tl-sand-2' />
      <ellipse cx={80} cy={115} rx={69} ry={31} className='fill-tl-sand' />
      <ellipse cx={80} cy={114} rx={61} ry={26.5} className='fill-tl-hill-s' />
      <ellipse
        cx={66}
        cy={104}
        rx={38}
        ry={12}
        className='fill-tl-hill-t'
        opacity={0.45}
      />
      <path
        d='M30 124 l2 -3 l1 3 M62 142 l2 -3 l1 3 M122 118 l2 -3 l1 3 M96 98 l2 -3 l1 3'
        className='fill-none stroke-tl-hill-w'
        strokeWidth={1}
        strokeLinecap='round'
      />
      <path
        d='M70 91 C62 100 74 106 66 112'
        className='fill-none stroke-tl-river'
        strokeWidth={3.4}
        strokeLinecap='round'
      />
      <path
        d='M70 91 C62 100 74 106 66 112'
        className='fill-none stroke-tl-foam'
        strokeOpacity={0.5}
        strokeWidth={1}
        strokeLinecap='round'
      />
      <Boulder x={72} y={92} rx={6} ry={4} />
      <Boulder x={65} y={93} rx={4} ry={3} />
      <Box shape={hut} wall='fill-tl-stone' />
      <Roof
        shape={{ ...hut, wl: 11, wr: 11, y: hut.y - 11, h: 0 }}
        roof='fill-tl-soil'
        gable
        rise={9}
      />
      <path
        d='M30.6 100 v-7 a3.4 3.4 0 0 1 6.8 0 v7z'
        className={WASH_DARK}
        opacity={0.55}
      />
      <ThatchPavilion cx={104} y={106} />
      <MudPool x={56} y={124} rx={23} />
      <SpringPool x={108} y={124} hw={19} gradient='tl-spring-water' />
      <Steam x={48} y={120} delay={0} />
      <Steam x={66} y={118} delay={1} />
      <Steam x={108} y={118} delay={2} />
      <Fern x={26} y={110} s={0.9} />
      <Palm x={15} y={124} s={0.95} />
      <g>
        <rect
          x={134.4}
          y={94}
          width={1.4}
          height={16}
          className='fill-tl-trunk'
        />
        <path
          d='M122 94 Q135 80 148 94 Q135 90 122 94z'
          className='fill-tl-stop-3'
        />
        <path
          d='M135 94 L135 83 M135 94 L128 85 M135 94 L142 85'
          className='fill-none stroke-tl-foam'
          strokeOpacity={0.55}
          strokeWidth={0.8}
        />
        <path
          d='M135 94 Q142 91 148 94 Q135 90 135 94z'
          className={WASH_DARK}
          opacity={0.2}
        />
      </g>
      <Lounger x={125} y={107} cushion='fill-tl-stop-4' />
      <Lounger x={137} y={111} cushion='fill-tl-stop-2' />
      <Palm x={149} y={116} s={0.8} lean={-1} />
      <MudTub x={84} y={134} />
      <MudTub x={90} y={141} />
      <Fern x={74} y={143} s={0.55} />
    </g>
  );
}

/** Ba Ho falls: three white steps through a heap of granite boulders in thick forest, a clear pool under each, a rope bridge, ferns and bamboo. */
export function WaterfallArt() {
  const hill =
    'M12 140 C14 102 30 72 54 54 C66 42 76 34 82 34 C92 34 102 44 114 58 C134 80 148 106 148 140 A68 11 0 0 1 12 140Z';
  const rock =
    'M54 130 C50 108 56 84 62 66 C66 54 72 48 80 48 C90 48 98 56 102 70 C108 90 112 112 112 130Z';
  return (
    <g>
      <defs>
        <linearGradient id='tl-baho-water' x1='0' y1='0' x2='0' y2='1'>
          <stop offset='0' style={{ stopColor: 'var(--tl-foam)' }} />
          <stop offset='1' style={{ stopColor: 'var(--tl-glass)' }} />
        </linearGradient>
      </defs>
      <Shadow rx={68} ry={11} cy={146} />
      <ellipse cx={80} cy={139} rx={70} ry={11.5} className='fill-tl-hill-w' />
      <path d={hill} className='fill-tl-hill-w' />
      <path
        d={hill}
        className='fill-tl-hill-s'
        transform='translate(-5 -2) scale(0.93 0.95)'
      />
      <Crown x={66} y={50} r={10} tone='fill-tl-hill-s' />
      <Crown x={96} y={52} r={10} tone='fill-tl-hill-s' />
      <Crown x={80} y={42} r={11} tone='fill-tl-hill-s' />
      <Crown x={46} y={68} r={9} />
      <Crown x={114} y={70} r={9} />
      <Crown x={34} y={86} r={10} tone='fill-tl-hill-s' />
      <Crown x={128} y={88} r={10} tone='fill-tl-hill-s' />
      <Crown x={26} y={108} r={11} />
      <Crown x={136} y={108} r={11} />
      <path d={rock} className='fill-tl-rock' />
      <path
        d={rock}
        className='fill-tl-rock-2'
        transform='translate(-3 -2) scale(0.92 0.96)'
      />
      <Boulder x={60} y={86} rx={12} ry={9} />
      <Boulder x={104} y={88} rx={12} ry={9} />
      <Tier
        x={81}
        top={56}
        bottom={78}
        wTop={9}
        wBottom={12}
        pool={{ rx: 15, ry: 4.4 }}
        gradient='tl-baho-water'
      />
      <Boulder x={58} y={106} rx={14} ry={10} />
      <Boulder x={106} y={108} rx={14} ry={10} />
      <Tier
        x={76}
        top={82}
        bottom={100}
        wTop={12}
        wBottom={16}
        pool={{ rx: 20, ry: 5.8 }}
        gradient='tl-baho-water'
      />
      <Boulder x={56} y={128} rx={16} ry={11} />
      <Boulder x={112} y={128} rx={16} ry={11} />
      <Tier
        x={82}
        top={104}
        bottom={124}
        wTop={16}
        wBottom={22}
        pool={{ rx: 31, ry: 8.6 }}
        gradient='tl-baho-water'
      />
      <ellipse
        cx={82}
        cy={126}
        rx={34}
        ry={7}
        className='fill-tl-foam'
        opacity={0.32}
      />
      <RopeBridge x1={48} x2={116} y={138} />
      <ellipse
        cx={98}
        cy={137.4}
        rx={2.4}
        ry={3.2}
        className='fill-tl-stop-3'
      />
      <circle cx={98} cy={132.6} r={1.7} className='fill-tl-trunk' />
      <Crown x={20} y={124} r={10} tone='fill-tl-park' />
      <Crown x={142} y={126} r={10} tone='fill-tl-park' />
      <Fern x={34} y={146} s={1.1} />
      <Fern x={124} y={147} s={1} />
      <Bamboo x={138} y={145} />
      <Fern x={86} y={149} s={0.5} />
    </g>
  );
}
