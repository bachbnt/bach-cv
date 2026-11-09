/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { fmt } from '@/skins/travel/map/sprites/art-town-math';

const FLAGS = [
  'fill-tl-stop-1',
  'fill-tl-sun',
  'fill-tl-wall',
  'fill-tl-stop-6',
  'fill-tl-coral',
] as const;

/** A string of prayer flags from (x1, y1) to (x2, y2), sagging a little, with five small pennants in the five colours. */
export function PrayerFlags({
  from,
  to,
}: {
  from: readonly [number, number];
  to: readonly [number, number];
}) {
  const at = (f: number) =>
    [
      from[0] + (to[0] - from[0]) * f,
      from[1] + (to[1] - from[1]) * f + Math.sin(Math.PI * f) * 4,
    ] as const;
  return (
    <g>
      <path
        d={`M${from[0]} ${from[1]} Q${(from[0] + to[0]) / 2} ${(from[1] + to[1]) / 2 + 8} ${to[0]} ${to[1]}`}
        className='fill-none stroke-tl-soil-2'
        strokeOpacity={0.6}
        strokeWidth={0.6}
      />
      {FLAGS.map((flag, i) => {
        const [x, y] = at((i + 1) / (FLAGS.length + 1));
        return (
          <path
            key={flag}
            d={`M${fmt(x - 1.5)} ${fmt(y)}h3l-1.5 3.4z`}
            className={flag}
          />
        );
      })}
    </g>
  );
}
