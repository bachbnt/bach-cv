/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { floor } from '@/skins/travel/map/sprites/art-theatre-frame';
import { fmt, rad } from '@/skins/travel/map/sprites/art-town-math';

const RADIUS = 30;
const SEAT_ROWS = [14, 20, 26];
/** Angles of the audience on the rows, as seen from the stage. */
const CROWD: readonly (readonly [number, number])[] = [
  [14, 160],
  [14, 200],
  [20, 172],
  [20, 212],
  [26, 150],
  [26, 190],
  [26, 232],
];

/** A half circle of the floor, in front of the mouth (the plane of the stage floor is dropped by the height of the stage). */
function ring(radius: number, from: number, to: number, steps: number) {
  return Array.from({ length: steps + 1 }, (_, i) => {
    const a = rad(from + ((to - from) * i) / steps);
    const [x, y] = floor(-10 + radius * Math.cos(a), radius * Math.sin(a), -6);
    return `${fmt(x)} ${fmt(y)}`;
  });
}

/** The audience plaza in front of the stage: a paved half circle with rows of seats and the people sitting in them. */
export function TheatrePlaza() {
  const half = ring(RADIUS, 90, 270, 14);
  const rows = SEAT_ROWS.map((r) => `M${ring(r, 105, 255, 10).join('L')}`).join(
    '',
  );
  const folk = CROWD.map(([r, a]) =>
    floor(-10 + r * Math.cos(rad(a)), r * Math.sin(rad(a)), -6),
  );
  return (
    <g>
      <path d={`M${half.join('L')}z`} className='fill-tl-walk' />
      <path
        d={`M${half.join('L')}z`}
        className='fill-none stroke-tl-stone'
        strokeWidth={1.4}
      />
      <path
        d={rows}
        className='fill-none stroke-tl-rock'
        strokeOpacity={0.55}
        strokeWidth={2.2}
        strokeDasharray='1.6 1.4'
      />
      <path
        d={folk.map(([x, y]) => `M${fmt(x)} ${fmt(y - 2)}v-3`).join('')}
        className='fill-none stroke-tl-coral'
        strokeWidth={2.2}
        strokeLinecap='round'
      />
      <path
        d={folk.map(([x, y]) => `M${fmt(x)} ${fmt(y - 7.4)}h0`).join('')}
        className='fill-none stroke-tl-trunk'
        strokeWidth={2}
        strokeLinecap='round'
      />
    </g>
  );
}
