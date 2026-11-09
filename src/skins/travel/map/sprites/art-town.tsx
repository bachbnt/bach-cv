/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import {
  Box,
  Cylinder,
  Mound,
  OnFace,
  Palm,
  Roof,
  Shadow,
  Tree,
  WASH_DARK,
  WASH_LIGHT,
  Win,
  type BoxShape,
} from '@/skins/travel/map/sprites/art-parts';
import { Bush } from '@/skins/travel/map/sprites/art-town-bush';
import { LobedDome } from '@/skins/travel/map/sprites/art-town-dome';
import { PicketFence } from '@/skins/travel/map/sprites/art-town-fence';
import { LongHipRoof } from '@/skins/travel/map/sprites/art-town-long-roof';
import { fmt, rad } from '@/skins/travel/map/sprites/art-town-math';
import { Parasol } from '@/skins/travel/map/sprites/art-town-parasol';
import { RoofTiles } from '@/skins/travel/map/sprites/art-town-roof-tiles';
import { WhaleSkeleton } from '@/skins/travel/map/sprites/art-town-whale';

const MARKET = { cx: 80, base: 124, r: 36, ry: 18, h: 30 };

/** A small kiosk of the plaza: a cream box under a hip awning (a token class). */
function Kiosk({ x, y, awning }: { x: number; y: number; awning: string }) {
  const shape: BoxShape = { cx: x, y, wl: 7, wr: 9, h: 6 };
  return (
    <g>
      <Box shape={shape} wall='fill-tl-sand' />
      <OnFace shape={shape} side='l' at={0.5}>
        <rect
          x={-2.6}
          y={-5}
          width={5.2}
          height={3.6}
          className='fill-tl-soil-2'
          opacity={0.7}
        />
      </OnFace>
      <Roof
        shape={{ ...shape, h: 8, wl: 8, wr: 10, cx: x }}
        roof={awning}
        rise={3}
      />
    </g>
  );
}

/** Dam Market: a round 1970s hall under a lobed rust-orange dome with a lantern and a flag, ringed by arches and pilasters, on a plaza of parasol stalls. */
export function DomeMarketArt() {
  const { cx, base, r, ry, h } = MARKET;
  const top = base - h;
  const front = base + ry;
  const rim = (deg: number, y: number) =>
    [cx + r * Math.sin(rad(deg)), y + ry * Math.cos(rad(deg))] as const;
  const arch = (deg: number, half: number, height: number) => {
    const [x1, y1] = rim(deg - half, base - 1.5);
    const [x2, y2] = rim(deg + half, base - 1.5);
    const crown = (y1 + y2) / 2 - height;
    const mid = (x1 + x2) / 2;
    return `M${fmt(x1)} ${fmt(y1)}V${fmt(y1 - height + 3)}Q${fmt(x1)} ${fmt(crown)} ${fmt(mid)} ${fmt(crown)}Q${fmt(x2)} ${fmt(crown)} ${fmt(x2)} ${fmt(y2 - height + 3)}V${fmt(y2)}z`;
  };
  const bays = [-72, -48, -24, 24, 48, 72];
  const piers = [-84, -60, -36, -12, 12, 36, 60, 84]
    .map((deg) => {
      const [x, y] = rim(deg, base);
      return `M${fmt(x)} ${fmt(y)}V${fmt(y - h)}`;
    })
    .join('');
  const [gx1, gy1] = rim(-10, base - 1.5);
  const [gx2] = rim(10, base - 1.5);
  const gate = Array.from({ length: 5 }, (_, i) => {
    const x = gx1 + ((gx2 - gx1) * (i + 0.5)) / 5;
    return `M${fmt(x)} ${fmt(gy1 + 0.4)}v-16`;
  }).join('');
  return (
    <g>
      <Shadow rx={64} ry={11} cy={149} />
      <ellipse cx={cx} cy={126} rx={62} ry={28} className='fill-tl-stone' />
      <ellipse cx={cx} cy={123} rx={62} ry={28} className='fill-tl-walk' />
      <ellipse
        cx={cx}
        cy={123}
        rx={62}
        ry={28}
        className={WASH_LIGHT}
        opacity={0.3}
      />
      <ellipse
        cx={cx}
        cy={124}
        rx={49}
        ry={22}
        className='fill-none stroke-tl-stone'
        strokeWidth={1}
        strokeOpacity={0.6}
      />
      <path
        d='M80 150V143M52 142L44 146M108 142L116 146M30 126H21M130 126H139M56 108L50 104M104 108L110 104'
        className='fill-none stroke-tl-stone'
        strokeWidth={0.9}
        strokeOpacity={0.5}
      />
      <Tree x={24} y={124} s={1.1} />
      <Tree x={138} y={122} s={1.1} />
      <Parasol x={22} y={138} canopy='fill-tl-coral' />
      <Parasol x={138} y={138} canopy='fill-tl-sun' />
      <path
        d={`M${cx - r} ${base + 2}A${r} ${ry} 0 0 0 ${cx + r} ${base + 2}`}
        className='fill-none stroke-tl-soil-2'
        strokeWidth={3}
        strokeOpacity={0.14}
      />
      <Cylinder
        cx={cx}
        y={base}
        r={r}
        h={h}
        wall='fill-tl-wall'
        top='fill-tl-wall'
      />
      <path
        d={piers}
        className='fill-none stroke-tl-foam'
        strokeWidth={2.2}
        strokeOpacity={0.55}
      />
      <path
        d={`M${cx - r + 1} ${top + 11}A${r} ${ry} 0 0 0 ${cx + r - 1} ${top + 11}`}
        className='fill-none stroke-tl-soil-2'
        strokeWidth={1.6}
        strokeDasharray='1.4 2.6'
        strokeOpacity={0.3}
      />
      {bays.map((deg) => (
        <path
          key={deg}
          d={arch(deg, 8, 17)}
          className='fill-tl-soil-2'
          opacity={0.82}
        />
      ))}
      <path d={arch(0, 10, 21)} className='fill-tl-soil-2' opacity={0.88} />
      <path
        d={gate}
        className='fill-none stroke-tl-glass'
        strokeWidth={0.8}
        strokeOpacity={0.75}
      />
      <path
        d={`M${cx - r} ${top}A${r} ${ry} 0 0 0 ${cx + r} ${top}v3.5A${r} ${ry} 0 0 1 ${cx - r} ${top + 3.5}z`}
        className='fill-tl-stone'
      />
      <path
        d={`M69 ${front + 1}L80 ${front + 6.5}L91 ${front + 1}V${front + 3.6}L80 ${front + 9.1}L69 ${front + 3.6}z`}
        className='fill-tl-stone'
      />
      <path
        d={`M70.5 ${front - 1.5}L80 ${front + 3.2}L89.5 ${front - 1.5}L80 ${front - 6.2}z`}
        className='fill-tl-walk'
      />
      <path
        d={`M71 ${front - 21}L80 ${front - 16.5}L89 ${front - 21}L80 ${front - 25.5}z`}
        className='fill-tl-coral'
      />
      <path
        d={`M71 ${front - 21}L80 ${front - 16.5}L89 ${front - 21}V${front - 19}L80 ${front - 14.5}L71 ${front - 19}z`}
        className='fill-tl-coral-2'
      />
      <LobedDome
        cx={cx}
        cy={top + 1}
        rx={r + 5}
        rise={30}
        lobes={9}
        gradientId='tl-market-dome'
      />
      <Cylinder cx={cx} y={top - 27} r={6} h={8} wall='fill-tl-wall' />
      <path
        d={`M${cx - 3.4} ${top - 28}v-4.5M${cx} ${top - 26.5}v-5M${cx + 3.4} ${top - 28}v-4.5`}
        className='fill-none stroke-tl-glass'
        strokeWidth={1.5}
      />
      <path
        d={`M${cx - 6.6} ${top - 35}L${cx} ${top - 47}L${cx + 6.6} ${top - 35}Q${cx} ${top - 31} ${cx - 6.6} ${top - 35}z`}
        className='fill-tl-roof'
      />
      <path
        d={`M${cx} ${top - 47}L${cx + 6.6} ${top - 35}Q${cx} ${top - 31} ${cx} ${top - 32.4}z`}
        className={WASH_DARK}
        opacity={0.26}
      />
      <path
        d={`M${cx} ${top - 47}V${top - 60}`}
        className='stroke-tl-ink'
        strokeWidth={1.2}
      />
      <path
        d={`M${cx} ${top - 60}q7 -3 14 0q-7 3 -14 7z`}
        className='tl-flag fill-tl-coral'
      />
      <Kiosk x={54} y={147} awning='fill-tl-coral' />
      <Kiosk x={110} y={148} awning='fill-tl-teal' />
      <Parasol x={34} y={145} canopy='fill-tl-stop-1' />
      <Parasol x={126} y={145} canopy='fill-tl-stop-3' />
    </g>
  );
}

const HOUSE: BoxShape = { cx: 76, y: 132, wl: 32, wr: 44, h: 34 };
const PORCH: BoxShape = { cx: 58, y: 132, wl: 14, wr: 9, h: 22 };

/** The Yersin museum: a two-storey colonial villa, cream walls, teal shutters, a gabled porch, a red tile hip roof, in a tropical garden. */
export function VillaArt() {
  return (
    <g>
      <Shadow rx={62} />
      <Mound x={80} y={150} w={150} h={26} />
      <path
        d='M30 144q-1 -3 -2 -4M36 146q0 -3 -1 -4M118 146q1 -3 0 -5M124 144q1 -3 2 -4M96 148q0 -3 -1 -4'
        className='fill-none stroke-tl-hill-t'
        strokeWidth={1.2}
        strokeLinecap='round'
      />
      <Palm x={30} y={122} s={1} lean={1} />
      <Tree x={127} y={134} s={1.1} />
      <path
        d='M44 137Q51 145 49 152L59 152Q59 144 52 140z'
        className='fill-tl-sand'
      />
      <Box shape={HOUSE} wall='fill-tl-wall' />
      <path
        d='M44 116L76 132v-2.6L44 113.4zM76 132L120 110v-2.6L76 129.4z'
        className='fill-tl-stone'
      />
      <path
        d='M44 99L76 115L120 93'
        className='fill-none stroke-tl-stone'
        strokeWidth={1.4}
      />
      <OnFace shape={HOUSE} side='l' at={0.5}>
        <Win x={-11.5} y={-21} w={4} h={9} shutters />
        <Win x={11.5} y={-21} w={4} h={9} shutters />
        <Win x={11.5} y={-3} w={4} h={11} shutters />
      </OnFace>
      <OnFace shape={HOUSE} side='r' at={0.5}>
        {[-14, 0, 14].map((x) => (
          <g key={x}>
            <Win x={x} y={-21} w={5} h={9} shutters />
            <path
              d={`M${x - 4.5} -1v-9a4.5 4.5 0 0 1 9 0v9z`}
              className='fill-tl-soil-2'
              opacity={0.7}
            />
          </g>
        ))}
        <path
          d='M-22 -34H22'
          className='fill-none stroke-tl-stone'
          strokeWidth={1.4}
        />
      </OnFace>
      <Roof shape={HOUSE} roof='fill-tl-roof' rise={16} />
      <RoofTiles shape={HOUSE} rise={16} />
      <rect x={98} y={61} width={7} height={13} className='fill-tl-brick' />
      <rect x={105} y={61} width={0} height={0} />
      <rect x={97} y={58.5} width={9} height={3} className='fill-tl-stone' />
      <Box shape={PORCH} wall='fill-tl-wall' />
      <OnFace shape={PORCH} side='l' at={0.5}>
        <path
          d='M-4.4 0v-12a4.4 4.4 0 0 1 8.8 0v12z'
          className='fill-tl-soil-2'
          opacity={0.78}
        />
        {[-6.4, 6.4].map((x) => (
          <rect
            key={x}
            x={x - 0.9}
            y={-21}
            width={1.8}
            height={21}
            className='fill-tl-stone'
          />
        ))}
      </OnFace>
      <Roof
        shape={PORCH}
        roof='fill-tl-roof'
        rise={9}
        gable
        end='fill-tl-wall'
      />
      <circle cx={51} cy={103.4} r={2} className='fill-tl-glass' />
      <Box
        shape={{ cx: 51, y: 134.5, wl: 10, wr: 4.5, h: 3 }}
        wall='fill-tl-stone'
      />
      <Box
        shape={{ cx: 47.5, y: 136.3, wl: 10, wr: 3.5, h: 1.6 }}
        wall='fill-tl-stone'
      />
      <Bush x={86} y={134} />
      <Bush x={98} y={129} s={0.9} />
      <PicketFence
        x1={14}
        y1={139}
        x2={40}
        y2={152}
        posts={7}
        stroke='stroke-tl-wall'
      />
      <PicketFence
        x1={64}
        y1={152}
        x2={96}
        y2={149}
        posts={6}
        stroke='stroke-tl-wall'
      />
      <PicketFence
        x1={98}
        y1={148}
        x2={132}
        y2={131}
        posts={8}
        stroke='stroke-tl-stone'
      />
      <Box
        shape={{ cx: 34, y: 139, wl: 4.6, wr: 4.6, h: 7 }}
        wall='fill-tl-stone'
      />
      <circle cx={34} cy={128} r={2.7} className='fill-tl-stone' />
      <Palm x={136} y={146} s={0.95} lean={-1} />
    </g>
  );
}

const HALL: BoxShape = { cx: 100, y: 130, wl: 48, wr: 26, h: 30 };
const WING: BoxShape = { cx: 52, y: 106, wl: 28, wr: 16, h: 16 };
const HALL_PORCH: BoxShape = { cx: 77, y: 125.6, wl: 16, wr: 7, h: 27 };

/** One tank window of the aquarium wing: sea water, a fish and a sprig of coral (use inside `OnFace`). */
function TankWindow({ x }: { x: number }) {
  return (
    <g>
      <path
        d={`M${x - 4.6} -3v-6.4a4.6 4.6 0 0 1 9.2 0v6.4z`}
        fill='url(#tl-ocean-tank)'
        className='stroke-tl-stone'
        strokeWidth={1}
      />
      <ellipse
        cx={x - 0.4}
        cy={-8}
        rx={1.9}
        ry={0.9}
        className='fill-tl-foam'
      />
      <path d={`M${x + 1.2} -8l1.8 -1v2z`} className='fill-tl-foam' />
      <path
        d={`M${x + 2} -3q-1.4 -2.2 0.4 -3.6M${x + 2} -3q1.4 -1.6 0.6 -3`}
        className='fill-none stroke-tl-coral'
        strokeWidth={0.8}
        strokeLinecap='round'
      />
    </g>
  );
}

/** The Institute of Oceanography: a pale yellow colonial hall of 1923 with an arched gallery, a pediment and an aquarium wing, a whale skeleton in front, the sea behind the seawall. */
export function AquariumArt() {
  return (
    <g>
      <defs>
        <linearGradient id='tl-ocean-tank' x1={0} y1={0} x2={0} y2={1}>
          <stop offset={0} style={{ stopColor: 'var(--tl-sea-1)' }} />
          <stop offset={1} style={{ stopColor: 'var(--tl-sea-3)' }} />
        </linearGradient>
      </defs>
      <Shadow rx={66} />
      <Mound x={80} y={150} w={150} h={24} />
      <Palm x={12} y={140} s={0.8} lean={1} />
      <path
        d='M116 128C118 114 148 104 158 116C161 128 142 140 122 136z'
        className='fill-tl-sea-2'
      />
      <path
        d='M124 126C128 117 146 113 153 119C152 127 138 132 128 131z'
        className='fill-tl-sea-1'
        opacity={0.55}
      />
      <path
        d='M122 127q4 -2 8 0t8 0M134 122q4 -2 8 0t6 0'
        className='fill-none stroke-tl-foam'
        strokeWidth={1}
        strokeLinecap='round'
        strokeOpacity={0.75}
      />
      <Box
        shape={{ cx: 127, y: 144, wl: 2.4, wr: 30, h: 4.5 }}
        wall='fill-tl-stone'
        top='fill-tl-walk'
      />
      <Box
        shape={{ cx: 106, y: 143, wl: 46, wr: 22, h: 2.5 }}
        wall='fill-tl-stone'
        top='fill-tl-walk'
      />
      <Box shape={WING} wall='fill-tl-sand' top='fill-tl-stone' />
      <OnFace shape={WING} side='l' at={0.5}>
        <TankWindow x={-7.5} />
        <TankWindow x={7.5} />
        <path
          d='M-14 -13.4H14'
          className='fill-none stroke-tl-stone'
          strokeWidth={1.6}
        />
      </OnFace>
      <Box shape={HALL} wall='fill-tl-sand' />
      <OnFace shape={HALL} side='l' at={0.5}>
        {[-20, -12.5, 12.5, 20].map((x) => (
          <g key={x}>
            <path
              d={`M${x - 2.8} 0v-9.2a2.8 2.8 0 0 1 5.6 0v9.2z`}
              className='fill-tl-soil-2'
              opacity={0.78}
            />
            <Win x={x} y={-19} w={5} h={9} arch />
          </g>
        ))}
        <path
          d='M-24 -14.6H24M-24 -29.4H24'
          className='fill-none stroke-tl-stone'
          strokeWidth={1.4}
        />
      </OnFace>
      <OnFace shape={HALL} side='r' at={0.5}>
        {[-8, 0, 8].map((x) => (
          <g key={x}>
            <path
              d={`M${x - 2.8} 0v-9.2a2.8 2.8 0 0 1 5.6 0v9.2z`}
              className='fill-tl-soil-2'
              opacity={0.7}
            />
            <Win x={x} y={-19} w={5} h={9} arch />
          </g>
        ))}
        <path
          d='M-13 -14.6H13M-13 -29.4H13'
          className='fill-none stroke-tl-stone'
          strokeWidth={1.4}
        />
      </OnFace>
      <LongHipRoof shape={HALL} roof='fill-tl-roof' rise={10} />
      <Box shape={HALL_PORCH} wall='fill-tl-sand' />
      <OnFace shape={HALL_PORCH} side='l' at={0.5}>
        <path
          d='M-4 0v-13a4 4 0 0 1 8 0v13z'
          className='fill-tl-soil-2'
          opacity={0.8}
        />
        {[-6.6, 6.6].map((x) => (
          <rect
            key={x}
            x={x - 1}
            y={-25}
            width={2}
            height={25}
            className='fill-tl-stone'
          />
        ))}
      </OnFace>
      <Roof
        shape={HALL_PORCH}
        roof='fill-tl-roof'
        rise={9}
        gable
        end='fill-tl-sand'
      />
      <circle cx={69} cy={91.6} r={2.1} className='fill-tl-glass' />
      <Box
        shape={{ cx: 69.8, y: 126, wl: 10, wr: 4, h: 2 }}
        wall='fill-tl-stone'
      />
      <Box
        shape={{ cx: 64.8, y: 127.3, wl: 10, wr: 3.5, h: 1 }}
        wall='fill-tl-stone'
      />
      <Box
        shape={{ cx: 68, y: 149, wl: 44, wr: 6, h: 2.5 }}
        wall='fill-tl-stone'
      />
      <WhaleSkeleton x={26} y={124} length={42} />
    </g>
  );
}
