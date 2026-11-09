/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { gothicPath } from '@/skins/travel/map/sprites/art-landmarks-gothic';
import {
  Box,
  OnFace,
  WASH_DARK,
  WASH_LIGHT,
  type BoxShape,
} from '@/skins/travel/map/sprites/art-parts';

const STOREY_W = 13;
const STOREY_H = 50;
const BELFRY_W = 11;
const BELFRY_H = 26;
const SPIRE_H = 34;

const CROSS = 'M0 0v-10M-2.8 -7h5.6';

/** Courses of cut stone on a face (the face is flat, `OnFace` slopes it). */
function blocks(w: number, h: number) {
  const out: string[] = [];
  for (let y = -3.4, row = 0; y > -h; y -= 3.4, row += 1) {
    out.push(`M${-w / 2} ${y}h${w}`);
    for (let x = -w / 2 + (row % 2) * 2.6 + 2.6; x < w / 2; x += 5.2)
      out.push(`M${x} ${y}v3.4`);
  }
  return out.join('');
}

/**
 * The bell tower of Nha Trang Cathedral: a stone storey with the pointed portal, a rose window and lancets, a narrower belfry
 * with great pointed openings, corner pinnacles and a tall spire with a cross. `cx`, `y` is the front corner on the ground.
 */
export function BellTower({ cx, y }: { cx: number; y: number }) {
  const storey: BoxShape = {
    cx,
    y,
    wl: STOREY_W,
    wr: STOREY_W,
    h: STOREY_H,
  };
  const centre = y - STOREY_H - STOREY_W / 2;
  const belfry: BoxShape = {
    cx,
    y: centre + BELFRY_W / 2,
    wl: BELFRY_W,
    wr: BELFRY_W,
    h: BELFRY_H,
  };
  const top = belfry.y - BELFRY_H;
  const ring = top - BELFRY_W / 2;
  const apex = ring - SPIRE_H;
  const a: readonly [number, number] = [cx - BELFRY_W, ring];
  const b: readonly [number, number] = [cx, top];
  const c: readonly [number, number] = [cx + BELFRY_W, ring];
  const left = `${a} ${b} ${cx},${apex}`;
  const right = `${b} ${c} ${cx},${apex}`;
  const bands = [0.25, 0.5, 0.75]
    .map((t) => {
      const at = (q: readonly [number, number]) =>
        `${q[0] + (cx - q[0]) * t} ${q[1] + (apex - q[1]) * t}`;
      return `M${at(a)}L${at(b)}L${at(c)}`;
    })
    .join('');
  const pinnacles = [a, b, c]
    .map(
      ([x, yy]) =>
        `M${x - 1.6} ${yy + 0.8}L${x} ${yy - 8}L${x + 1.6} ${yy + 0.8}z`,
    )
    .join('');
  return (
    <g>
      <Box shape={storey} wall='fill-tl-rock-2' />
      <OnFace shape={storey} side='l' at={0.5}>
        <path
          d={blocks(STOREY_W, STOREY_H)}
          className='fill-none stroke-tl-soil-2'
          strokeOpacity={0.15}
          strokeWidth={0.5}
        />
        <path
          d={gothicPath(0, 0, 9.4, 21)}
          className={WASH_LIGHT}
          opacity={0.4}
        />
        <path
          d={gothicPath(0, 0, 6.4, 18)}
          className='fill-tl-soil-2'
          opacity={0.88}
        />
        <circle cx={0} cy={-29} r={3.6} className='fill-tl-glass' />
        <path
          d='M0 -32.6v7.2M-3.6 -29h7.2M-2.5 -31.5l5 5M2.5 -31.5l-5 5'
          className='fill-none stroke-tl-rock'
          strokeWidth={0.5}
        />
        <circle
          cx={0}
          cy={-29}
          r={3.6}
          className='fill-none stroke-tl-rock'
          strokeWidth={1}
        />
        <path d={gothicPath(0, -37, 3.6, 10)} className='fill-tl-glass' />
        <path
          d='M-6.5 -35h13'
          className='fill-none stroke-tl-foam'
          strokeOpacity={0.45}
          strokeWidth={0.8}
        />
      </OnFace>
      <OnFace shape={storey} side='r' at={0.5}>
        <path
          d={blocks(STOREY_W, STOREY_H)}
          className='fill-none stroke-tl-soil-2'
          strokeOpacity={0.15}
          strokeWidth={0.5}
        />
        <path
          d={`${gothicPath(0, -12, 4, 12)}${gothicPath(0, -37, 3.6, 10)}`}
          className='fill-tl-glass'
        />
      </OnFace>
      <path
        d={`M${cx} ${y}V${y - STOREY_H}`}
        className='fill-none stroke-tl-foam'
        strokeOpacity={0.55}
        strokeWidth={1.2}
      />
      <Box shape={belfry} wall='fill-tl-rock-2' />
      <OnFace shape={belfry} side='l' at={0.5}>
        <path
          d={gothicPath(0, -2, 6.6, 20)}
          className='fill-tl-soil-2'
          opacity={0.82}
        />
        <path
          d='M-2.6 -6h5.2M-2.6 -10h5.2M-2.6 -14h5.2'
          className='fill-none stroke-tl-foam'
          strokeOpacity={0.4}
          strokeWidth={0.6}
        />
      </OnFace>
      <OnFace shape={belfry} side='r' at={0.5}>
        <path
          d={gothicPath(0, -2, 6.6, 20)}
          className='fill-tl-soil-2'
          opacity={0.7}
        />
      </OnFace>
      <polygon points={left} className='fill-tl-rock' />
      <polygon points={right} className='fill-tl-rock' />
      <polygon points={left} className={WASH_LIGHT} opacity={0.2} />
      <polygon points={right} className={WASH_DARK} opacity={0.3} />
      <path
        d={bands}
        className='fill-none stroke-tl-soil-2'
        strokeOpacity={0.25}
        strokeWidth={0.5}
      />
      <path d={pinnacles} className='fill-tl-rock-2' />
      <g transform={`translate(${cx} ${apex})`}>
        <path
          d={CROSS}
          className='fill-none stroke-tl-soil-2'
          strokeOpacity={0.55}
          strokeWidth={2.2}
          strokeLinecap='round'
        />
        <path
          d={CROSS}
          className='fill-none stroke-tl-wall'
          strokeWidth={1}
          strokeLinecap='round'
        />
      </g>
    </g>
  );
}
