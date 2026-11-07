/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import {
  Box,
  Boulder,
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

const PODS = [
  'fill-tl-stop-3',
  'fill-tl-stop-4',
  'fill-tl-stop-2',
  'fill-tl-stop-1',
  'fill-tl-stop-5',
  'fill-tl-stop-6',
] as const;
const WHEEL = { x: 50, y: 82, r: 33 } as const;

/** A big Ferris wheel: an A-frame, a rim, spokes and gondolas that turn slowly and stay upright (`tl-wheel`, `tl-pod`). */
function FerrisWheel() {
  const { x, y, r } = WHEEL;
  return (
    <g>
      <path
        d={`M${x} ${y} L${x - 18} 130 M${x} ${y} L${x + 18} 130 M${x - 13} 113 H${x + 13}`}
        className='fill-none stroke-tl-rock'
        strokeWidth={3.2}
        strokeLinecap='round'
      />
      <path
        d={`M${x} ${y} L${x - 18} 130 M${x} ${y} L${x + 18} 130`}
        className='fill-none stroke-tl-wall'
        strokeWidth={1.8}
        strokeLinecap='round'
      />
      <g className='tl-wheel'>
        <circle
          cx={x}
          cy={y}
          r={r}
          className='fill-none stroke-tl-coral'
          strokeWidth={2.6}
        />
        <circle
          cx={x}
          cy={y}
          r={r * 0.62}
          className='fill-none stroke-tl-coral-2'
          strokeWidth={1.4}
        />
        {Array.from({ length: 8 }, (_, i) => (
          <path
            key={i}
            d={`M${x} ${y} L${x + r * Math.sin((i * Math.PI) / 4)} ${y - r * Math.cos((i * Math.PI) / 4)}`}
            className='stroke-tl-wall'
            strokeWidth={1}
          />
        ))}
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i * Math.PI) / 6;
          return (
            <g
              key={i}
              transform={`translate(${x + r * Math.sin(a)} ${y - r * Math.cos(a)})`}
            >
              <g className='tl-pod'>
                <path
                  d='M0 0 v2.4'
                  className='stroke-tl-ink'
                  strokeWidth={0.8}
                />
                <rect
                  x={-3.2}
                  y={2.2}
                  width={6.4}
                  height={6}
                  rx={1.8}
                  className={PODS[i % PODS.length]}
                />
                <rect
                  x={-2}
                  y={3.4}
                  width={4}
                  height={2}
                  rx={0.6}
                  className='fill-tl-glass'
                />
              </g>
            </g>
          );
        })}
      </g>
      <circle cx={x} cy={y} r={3.6} className='fill-tl-sun' />
      <circle cx={x} cy={y} r={1.4} className={WASH_DARK} opacity={0.4} />
    </g>
  );
}

/** A cone tower of the fairy-tale castle with a flag. */
function ConeTower({
  cx,
  y,
  h,
  roof,
}: {
  cx: number;
  y: number;
  h: number;
  roof: string;
}) {
  const top = y - h;
  return (
    <g>
      <Cylinder
        cx={cx}
        y={y}
        r={6}
        h={h}
        wall='fill-tl-wall'
        top='fill-tl-wall'
      />
      <path
        d={`M${cx - 6} ${y - h * 0.62} h12`}
        className='stroke-tl-stone'
        strokeWidth={1}
      />
      <path
        d={`M${cx - 2.4} ${y - h * 0.5} v-4 a2.4 2.4 0 0 1 4.8 0 v4z`}
        className='fill-tl-glass'
      />
      <path
        d={`M${cx - 9} ${top + 2} L${cx} ${top - 21} L${cx + 9} ${top + 2} Q${cx} ${top + 6.5} ${cx - 9} ${top + 2}z`}
        className={roof}
      />
      <path
        d={`M${cx} ${top - 21} L${cx + 9} ${top + 2} Q${cx + 4} ${top + 5} ${cx} ${top + 5}z`}
        className={WASH_DARK}
        opacity={0.28}
      />
      <path
        d={`M${cx} ${top - 21} v-6`}
        className='stroke-tl-ink'
        strokeWidth={1}
      />
      <path
        d={`M${cx} ${top - 27} q5 -2 9 0 q-4 2 -9 4z`}
        className='tl-flag fill-tl-sun'
      />
    </g>
  );
}

/** Vinpearl on Hon Tre: a green island with sand, a big Ferris wheel, a fairy-tale castle with two cone towers and a palm. */
export function FerrisIslandArt() {
  const keep: BoxShape = { cx: 112, y: 136, wl: 20, wr: 20, h: 22 };
  return (
    <g>
      <Shadow rx={68} ry={11} />
      <ellipse
        cx={80}
        cy={148}
        rx={72}
        ry={14}
        className='fill-tl-foam'
        opacity={0.5}
      />
      <ellipse cx={80} cy={147} rx={68} ry={12} className='fill-tl-sand-2' />
      <ellipse cx={80} cy={145} rx={63} ry={10.5} className='fill-tl-sand' />
      <Mound x={80} y={143} w={124} h={46} />
      <Tree x={20} y={138} s={0.7} />
      <FerrisWheel />
      <ConeTower cx={96} y={135} h={36} roof='fill-tl-stop-3' />
      <Box shape={keep} wall='fill-tl-wall' />
      <OnFace shape={keep} side='l' at={0.5}>
        <path
          d='M-3.4 0 v-8 a3.4 3.4 0 0 1 6.8 0 v8z'
          className='fill-tl-soil-2'
          opacity={0.75}
        />
        <Win x={-6} y={-16} w={3.4} h={5} arch />
        <Win x={6} y={-16} w={3.4} h={5} arch />
      </OnFace>
      <OnFace shape={keep} side='r' at={0.5}>
        <Win x={-5} y={-12} w={3.4} h={5} arch />
        <Win x={5} y={-12} w={3.4} h={5} arch />
      </OnFace>
      <Roof shape={keep} roof='fill-tl-stop-2' rise={5} />
      <ConeTower cx={128} y={134} h={42} roof='fill-tl-stop-2' />
      <Palm x={142} y={142} s={1} lean={-1} />
      <Palm x={26} y={147} s={0.8} />
      <Boulder x={68} y={150} rx={7} ry={4} />
    </g>
  );
}

/** The base station of the cable car: a small station, a gondola waiting beside it and a pylon whose top is where the cable leaves (80, 120). */
export function CableCarArt() {
  const hall: BoxShape = { cx: 40, y: 142, wl: 32, wr: 24, h: 12 };
  return (
    <g>
      <Shadow rx={62} />
      <Mound x={80} y={149} w={136} h={14} />
      <Box
        shape={{ cx: 40, y: 146, wl: 38, wr: 30, h: 3 }}
        wall='fill-tl-stone'
      />
      <Box shape={hall} wall='fill-tl-wall' />
      <OnFace shape={hall} side='l' at={0.5}>
        <path
          d='M-4.5 0 v-7 a4.5 4.5 0 0 1 9 0 v7z'
          className='fill-tl-soil-2'
          opacity={0.75}
        />
        <Win x={-10} y={-3} w={5} h={7} />
        <Win x={10} y={-3} w={5} h={7} />
      </OnFace>
      <OnFace shape={hall} side='r' at={0.5}>
        <rect
          x={-8}
          y={-9}
          width={16}
          height={5.5}
          rx={1.5}
          className='fill-tl-glass'
        />
      </OnFace>
      <Roof
        shape={{ cx: 40, y: 144, wl: 36, wr: 28, h: 13 }}
        roof='fill-tl-roof'
        rise={9}
      />
      <g>
        <path
          d='M68 150 L80 120 L92 150 M72 140 H88 M75 131 H85 M72 140 L88 150 M88 140 L72 150'
          className='fill-none stroke-tl-rock'
          strokeWidth={2.4}
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M68 150 L80 120 L92 150'
          className='fill-none stroke-tl-rock-2'
          strokeWidth={1.1}
          strokeLinecap='round'
        />
        <rect
          x={71}
          y={117.5}
          width={18}
          height={3.4}
          rx={1.2}
          className='fill-tl-rock'
        />
        <circle cx={80} cy={120} r={4} className='fill-tl-wall' />
        <circle cx={80} cy={120} r={1.6} className='fill-tl-ink' />
      </g>
      <g transform='translate(116 146)'>
        <rect x={-1} y={-6} width={2} height={6} className='fill-tl-rock' />
        <path d='M0 -6 v-5' className='stroke-tl-ink' strokeWidth={1} />
        <rect
          x={-8}
          y={-11}
          width={16}
          height={12}
          rx={3}
          className='fill-tl-coral'
        />
        <rect
          x={-6}
          y={-8.6}
          width={12}
          height={5}
          rx={1.4}
          className='fill-tl-glass'
        />
        <rect
          x={-8}
          y={-11}
          width={16}
          height={4}
          rx={2}
          className={WASH_LIGHT}
          opacity={0.3}
        />
      </g>
      <Tree x={142} y={146} s={0.8} />
    </g>
  );
}
