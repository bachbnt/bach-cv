/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import {
  Box,
  WASH_DARK,
  WASH_LIGHT,
} from '@/skins/travel/map/sprites/art-parts';
import { fmt } from '@/skins/travel/map/sprites/art-town-math';

const STOREYS = 13;
const BODY = 0.9;
const SLAB = 1.1;
const OVERHANG = 1.3;

const q = (list: readonly (readonly [number, number])[]) =>
  `M${list.map(([x, y]) => `${fmt(x)} ${fmt(y)}`).join('L')}z`;

interface Storey {
  y: number;
  w: number;
}

/** The storeys from the bottom up: each narrower than the one under it and standing on the middle of its roof. */
function storeys(base: number): Storey[] {
  const out: Storey[] = [];
  let y = base;
  for (let k = 0; k < STOREYS; k++) {
    const w = 7.2 - k * 0.35;
    out.push({ y, w });
    const next = 7.2 - (k + 1) * 0.35;
    y -= BODY + SLAB + (w + OVERHANG) / 2 - next / 2;
  }
  return out;
}

/**
 * The stupa of the monastery (bao thap muoi ba tang): a stone plinth under thirteen small roofed storeys, each narrower than the one
 * under it, in gold, with a spire. The pieces of all storeys are joined by kind so that the whole tower is a few shapes: the roofs
 * first, then the walls on them, then the thick edges of the roofs.
 */
export function ThirteenStupa({ x, y }: { x: number; y: number }) {
  const list = storeys(y - 5);
  const tops: string[] = [];
  const wallsL: string[] = [];
  const wallsR: string[] = [];
  const edgesL: string[] = [];
  const edgesR: string[] = [];
  for (const { y: by, w } of list) {
    const t = by - BODY;
    const e = w + OVERHANG;
    const lift = 0.9;
    wallsL.push(
      q([
        [x - w, by - w / 2],
        [x, by],
        [x, t],
        [x - w, t - w / 2],
      ]),
    );
    wallsR.push(
      q([
        [x, by],
        [x + w, by - w / 2],
        [x + w, t - w / 2],
        [x, t],
      ]),
    );
    const r = t - SLAB;
    tops.push(
      q([
        [x - e - 0.8, r - e / 2 - lift],
        [x, r + 0.4],
        [x + e + 0.8, r - e / 2 - lift],
        [x, r - e - 0.6],
      ]),
    );
    edgesL.push(
      q([
        [x - e - 0.8, r - e / 2 - lift],
        [x, r + 0.4],
        [x, t + 0.4],
        [x - e, t - e / 2],
      ]),
    );
    edgesR.push(
      q([
        [x, r + 0.4],
        [x + e + 0.8, r - e / 2 - lift],
        [x + e, t - e / 2],
        [x, t + 0.4],
      ]),
    );
  }
  const top = list[list.length - 1];
  const apex = top ? top.y - BODY - SLAB - 1 : y;
  return (
    <g>
      <Box shape={{ cx: x, y, wl: 10, wr: 10, h: 5 }} wall='fill-tl-stone' />
      <path d={tops.join('')} className='fill-tl-sand-2' />
      <path d={tops.join('')} className={WASH_LIGHT} opacity={0.25} />
      <path d={wallsL.join('')} className='fill-tl-sun' />
      <path d={wallsR.join('')} className='fill-tl-sun' />
      <path d={wallsR.join('')} className={WASH_DARK} opacity={0.3} />
      <path d={edgesL.join('')} className='fill-tl-sun' />
      <path d={edgesL.join('')} className={WASH_DARK} opacity={0.12} />
      <path d={edgesR.join('')} className='fill-tl-sun' />
      <path d={edgesR.join('')} className={WASH_DARK} opacity={0.38} />
      <path
        d={`M${x} ${fmt(apex + 1)}V${fmt(apex - 7)}`}
        className='fill-none stroke-tl-sun'
        strokeWidth={1.2}
        strokeLinecap='round'
      />
      <circle cx={x} cy={apex - 3} r={1.7} className='fill-tl-sun' />
      <circle cx={x} cy={apex - 7.6} r={1.1} className='fill-tl-lane' />
    </g>
  );
}
