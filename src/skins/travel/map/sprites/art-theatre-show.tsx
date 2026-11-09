/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { at, floor } from '@/skins/travel/map/sprites/art-theatre-frame';
import { fmt } from '@/skins/travel/map/sprites/art-town-math';

const FOOTLIGHTS = [-30, -24, -18, 18, 24, 30];
/** Where the dancers stand on the stage floor inside the mouth, as [u, s]. */
const DANCERS = [
  [4, -8],
  [6, 1],
  [4, 9],
] as const;

/** What happens on the stage: two beams of light from the rim, three dancers inside the mouth, and the footlights on the stage edge. */
export function TheatreShow() {
  const people = DANCERS.map(([u, s]) => at(u, s, -13.4));
  const beam = (s0: number, s1: number) => {
    const top = at(0, s0, 19);
    const a = at(8, s1 - 5, -13.4);
    const b = at(8, s1 + 5, -13.4);
    return `M${fmt(top[0])} ${fmt(top[1])}L${fmt(a[0])} ${fmt(a[1])}L${fmt(b[0])} ${fmt(b[1])}z`;
  };
  return (
    <g>
      <path
        d={`${beam(-6, -6)}${beam(8, 7)}`}
        className='fill-tl-lane'
        opacity={0.18}
      />
      <path
        d={people.map(([x, y]) => `M${fmt(x)} ${fmt(y)}v-4.4`).join('')}
        className='fill-none stroke-tl-coral'
        strokeWidth={2}
        strokeLinecap='round'
      />
      <path
        d={people.map(([x, y]) => `M${fmt(x)} ${fmt(y - 6.6)}h0`).join('')}
        className='fill-none stroke-tl-trunk'
        strokeWidth={1.8}
        strokeLinecap='round'
      />
      <path
        d={FOOTLIGHTS.map((s) => {
          const [x, y] = floor(-10, s, -2.6);
          return `M${fmt(x)} ${fmt(y)}h0`;
        }).join('')}
        className='fill-none stroke-tl-lane'
        strokeWidth={1.8}
        strokeLinecap='round'
      />
    </g>
  );
}
