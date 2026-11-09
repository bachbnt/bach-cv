/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { WASH_DARK, WASH_LIGHT } from '@/skins/travel/map/sprites/art-parts';

const R = 3.6;
const H = 8;
const STEP = 13;

/** The yard of the fish-sauce makers: rows of big wooden barrels with hooped sides and pale lids, [column, row] on the ground. */
const SLOTS: readonly (readonly [number, number])[] = [
  [0, 0],
  [1, 0],
  [2, 0],
  [0, 1],
  [1, 1],
  [2, 1],
  [0, 2],
  [1, 2],
];

/** A yard of barrels standing on its front corner (x, y), laid out on the isometric grid. */
export function BarrelYard({ x, y }: { x: number; y: number }) {
  const barrels = SLOTS.map(([c, r]) => ({
    x: x + (c + r) * STEP * 0.5,
    y: y + (r - c) * STEP * 0.25,
  })).sort((a, b) => a.y - b.y || a.x - b.x);
  const body = barrels
    .map(
      (b) =>
        `M${b.x - R} ${b.y}V${b.y - H}Q${b.x} ${b.y - H - 2.4} ${b.x + R} ${b.y - H}V${b.y}Q${b.x} ${b.y + 2} ${b.x - R} ${b.y}z`,
    )
    .join('');
  const shade = barrels
    .map(
      (b) =>
        `M${b.x + R * 0.3} ${b.y + 1.9}Q${b.x + R * 0.8} ${b.y + 1.5} ${b.x + R} ${b.y}V${b.y - H}Q${b.x + R * 0.8} ${b.y - H - 1.6} ${b.x + R * 0.3} ${b.y - H - 1.6}z`,
    )
    .join('');
  const hoops = barrels
    .map(
      (b) =>
        `M${b.x - R} ${b.y - 2}Q${b.x} ${b.y - 0.2} ${b.x + R} ${b.y - 2}M${b.x - R} ${b.y - H + 2}Q${b.x} ${b.y - H + 3.8} ${b.x + R} ${b.y - H + 2}`,
    )
    .join('');
  const lids = barrels
    .map(
      (b) =>
        `M${b.x - R} ${b.y - H}a${R} ${R * 0.5} 0 1 0 ${R * 2} 0a${R} ${R * 0.5} 0 1 0 ${-R * 2} 0z`,
    )
    .join('');
  return (
    <g>
      <path d={body} className='fill-tl-soil' />
      <path d={shade} className={WASH_DARK} opacity={0.3} />
      <path
        d={hoops}
        className='fill-none stroke-tl-soil-2'
        strokeOpacity={0.55}
        strokeWidth={0.7}
      />
      <path d={lids} className='fill-tl-sand-2' />
      <path d={lids} className={WASH_LIGHT} opacity={0.3} />
    </g>
  );
}
