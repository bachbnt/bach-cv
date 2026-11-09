/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import {
  Box,
  Roof,
  WASH_DARK,
  type BoxShape,
} from '@/skins/travel/map/sprites/art-parts';

const W = 16; // half width of the floor
const RISE = 15;

/** A thatched pavilion on stilts: a plank floor on three visible posts, four columns and a pyramid roof of straw. Stands on (cx, y). */
export function ThatchPavilion({ cx, y }: { cx: number; y: number }) {
  const floorY = y - 8;
  const floor: BoxShape = { cx, y: floorY, wl: W, wr: W, h: 2.5 };
  const eaveY = floorY - 24;
  const eave: BoxShape = { cx, y: eaveY, wl: W + 4, wr: W + 4, h: 0 };
  // the apex of the pyramid and the two front eave corners, to lay the straw ribs
  const apex = [cx, eaveY - (W + 4) / 2 - RISE] as const;
  const left = [cx - W - 4, eaveY - (W + 4) / 2] as const;
  const right = [cx + W + 4, eaveY - (W + 4) / 2] as const;
  const front = [cx, eaveY] as const;
  const ribs = [0.28, 0.56, 0.84]
    .map((k) => {
      const l = [
        left[0] + (front[0] - left[0]) * k,
        left[1] + (front[1] - left[1]) * k,
      ];
      const r = [
        right[0] + (front[0] - right[0]) * k,
        right[1] + (front[1] - right[1]) * k,
      ];
      return `M${apex} L${l} M${apex} L${r}`;
    })
    .join(' ');
  return (
    <g>
      <g className='fill-tl-trunk'>
        <rect x={cx - 1.2} y={floorY} width={2.4} height={9} />
        <rect x={cx - W - 1.2} y={floorY - W / 2} width={2.4} height={9} />
        <rect x={cx + W - 1.2} y={floorY - W / 2} width={2.4} height={9} />
      </g>
      <Box shape={floor} wall='fill-tl-trunk' top='fill-tl-soil' />
      <path
        d={`M${cx - W} ${floorY - 2.5 - W / 2} L${cx} ${floorY - 2.5} L${cx + W} ${floorY - 2.5 - W / 2} L${cx + W} ${eaveY - W / 2} L${cx} ${eaveY} L${cx - W} ${eaveY - W / 2}z`}
        className={WASH_DARK}
        opacity={0.22}
      />
      <path
        d={`M${cx - W} ${floorY - 2.5 - W / 2} V${eaveY - W / 2} M${cx} ${floorY - 2.5} V${eaveY} M${cx + W} ${floorY - 2.5 - W / 2} V${eaveY - W / 2}`}
        className='fill-none stroke-tl-trunk'
        strokeWidth={2}
      />
      <Roof shape={eave} roof='fill-tl-soil' rise={RISE} />
      <path
        d={ribs}
        className='fill-none stroke-tl-soil-2'
        strokeOpacity={0.35}
        strokeWidth={0.7}
      />
    </g>
  );
}
