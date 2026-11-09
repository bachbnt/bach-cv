/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { at } from '@/skins/travel/map/sprites/art-theatre-frame';
import { fmt, rad } from '@/skins/travel/map/sprites/art-town-math';

const MOUTH = 28;
const LANTERNS = [96, 110, 124, 138, 152, 166];
const SPOTS = [58, 72, 86, 100, 114];

/** Lanterns hung from the upper rim of the mouth, and the row of stage lights just inside it. */
export function TheatreLights() {
  const hung = LANTERNS.map((deg) => {
    const [x, y] = at(
      0,
      (MOUTH + 1) * Math.cos(rad(deg)),
      (MOUTH + 1) * Math.sin(rad(deg)),
    );
    return { x, y, warm: deg % 28 === 12 };
  });
  const spots = SPOTS.map((deg) =>
    at(0, (MOUTH - 5) * Math.cos(rad(deg)), (MOUTH - 5) * Math.sin(rad(deg))),
  );
  return (
    <g>
      <path
        d={hung.map(({ x, y }) => `M${fmt(x)} ${fmt(y)}v5`).join('')}
        className='fill-none stroke-tl-trunk'
        strokeWidth={0.6}
      />
      <path
        d={hung
          .filter((l) => l.warm)
          .map(({ x, y }) => `M${fmt(x)} ${fmt(y + 7)}h0`)
          .join('')}
        className='fill-none stroke-tl-coral'
        strokeWidth={4}
        strokeLinecap='round'
      />
      <path
        d={hung
          .filter((l) => !l.warm)
          .map(({ x, y }) => `M${fmt(x)} ${fmt(y + 7)}h0`)
          .join('')}
        className='fill-none stroke-tl-sun'
        strokeWidth={4}
        strokeLinecap='round'
      />
      <path
        d={spots.map(([x, y]) => `M${fmt(x)} ${fmt(y)}h0`).join('')}
        className='fill-none stroke-tl-sun'
        strokeOpacity={0.35}
        strokeWidth={5}
        strokeLinecap='round'
      />
      <path
        d={spots.map(([x, y]) => `M${fmt(x)} ${fmt(y)}h0`).join('')}
        className='fill-none stroke-tl-lane'
        strokeWidth={2}
        strokeLinecap='round'
      />
    </g>
  );
}
