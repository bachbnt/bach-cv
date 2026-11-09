/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { WASH_DARK, WASH_LIGHT } from '@/skins/travel/map/sprites/art-parts';

/** The lotus is a bud of petals standing in two rows round the shaft: `bx` where a petal starts, `tx` where its tip leans to. */
const PETALS = {
  back: [
    { bx: -5, tx: -10, h: 78, w: 15 },
    { bx: 5, tx: 10, h: 78, w: 15 },
  ],
  front: [
    { bx: -11, tx: -27, h: 50, w: 14 },
    { bx: 11, tx: 27, h: 50, w: 14 },
    { bx: -6, tx: -13, h: 63, w: 15 },
    { bx: 6, tx: 13, h: 63, w: 15 },
    { bx: 0, tx: 0, h: 70, w: 14 },
  ],
} as const;

const BASE_HALF = 5;

/** One row of the petals of the Tram Huong lotus, with their base at (cx, y). `fill` is the paint of the petals (a gradient or a token class). */
export function LotusPetals({
  row,
  cx,
  y,
  fill,
}: {
  row: 'back' | 'front';
  cx: number;
  y: number;
  fill: string;
}) {
  const petals = PETALS[row].map(({ bx, tx, h, w }) => {
    const x0 = cx + bx;
    const x1 = cx + tx;
    const top = y - h;
    const mid = (x0 + x1) / 2;
    const left = `C${x0 - w} ${y - h * 0.3} ${mid - w * 0.55} ${top + h * 0.3} ${x1} ${top}`;
    const rightBack = `C${mid + w * 0.55} ${top + h * 0.3} ${x0 + w} ${y - h * 0.3} ${x0 + BASE_HALF} ${y}`;
    return {
      body: `M${x0 - BASE_HALF} ${y}${left}${rightBack}z`,
      shade: `M${x0} ${y}L${x1} ${top}${rightBack}z`,
      rib: `M${x0} ${y}Q${mid} ${y - h * 0.5} ${x1} ${top}`,
      lit: `M${x0 - BASE_HALF} ${y}${left}L${x0} ${y - h * 0.4}z`,
    };
  });
  return (
    <g>
      {petals.map(({ body, shade, lit }, i) => (
        <g key={i}>
          <path d={body} fill={fill} />
          <path d={lit} className={WASH_LIGHT} opacity={0.32} />
          <path d={shade} className={WASH_DARK} opacity={0.2} />
        </g>
      ))}
      <path
        d={petals.map(({ rib }) => rib).join('')}
        className='fill-none stroke-tl-coral'
        strokeOpacity={0.45}
        strokeWidth={0.5}
      />
    </g>
  );
}
