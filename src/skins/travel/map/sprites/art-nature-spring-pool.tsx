/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { WASH_DARK } from '@/skins/travel/map/sprites/art-parts';

const pts = (list: readonly (readonly [number, number])[]) =>
  list.map((p) => `${p[0]},${p[1]}`).join(' ');

/** A diamond (a rectangle seen in isometric) around a centre, grown by `d`. */
const diamond = (x: number, y: number, hw: number, d = 0) =>
  pts([
    [x - hw - d * 2, y],
    [x, y - hw / 2 - d],
    [x + hw + d * 2, y],
    [x, y + hw / 2 + d],
  ]);

/**
 * A mineral pool in a plank deck: wood, a stone coping (a thick round-joined stroke) and turquoise water with a lit ladder.
 * `gradient` is the id of a linearGradient that fills the water.
 */
export function SpringPool({
  x,
  y,
  hw,
  gradient,
}: {
  x: number;
  y: number;
  hw: number;
  gradient: string;
}) {
  const a = hw + 10;
  const planks = [0.17, 0.33, 0.5, 0.67, 0.83]
    .map((t) => `M${x - a + a * t} ${y + (a / 2) * t} l${a} ${-a / 2}`)
    .join(' ');
  return (
    <g>
      <polygon points={diamond(x, y + 3, hw, 5)} className='fill-tl-trunk' />
      <polygon points={diamond(x, y, hw, 5)} className='fill-tl-soil' />
      <path
        d={planks}
        className='fill-none stroke-tl-trunk'
        strokeOpacity={0.4}
        strokeWidth={0.7}
      />
      <polygon
        points={diamond(x, y + 2.5, hw, 0)}
        className='fill-tl-rock stroke-tl-rock'
        strokeWidth={4.5}
        strokeLinejoin='round'
      />
      <polygon
        points={diamond(x, y, hw, 0)}
        className='stroke-tl-stone'
        strokeWidth={4.5}
        strokeLinejoin='round'
        fill={`url(#${gradient})`}
      />
      <polygon
        points={diamond(x, y - 1.2, hw * 0.78, 0)}
        className={`${WASH_DARK}`}
        opacity={0.16}
      />
      <path
        d={`M${x - hw * 0.5} ${y + 0.5} q${hw * 0.2} -3 ${hw * 0.55} -2.4 M${x + hw * 0.1} ${y + hw * 0.22} q${hw * 0.2} 1 ${hw * 0.4} -1.4`}
        className='fill-none stroke-tl-foam'
        strokeOpacity={0.6}
        strokeWidth={1.1}
        strokeLinecap='round'
      />
      <path
        d={`M${x + hw * 0.55} ${y - hw * 0.18} v-4 a1.6 1.6 0 0 1 3.2 0 M${x + hw * 0.55 + 3.2} ${y - hw * 0.18} v-4`}
        className='fill-none stroke-tl-foam'
        strokeWidth={0.9}
      />
    </g>
  );
}
