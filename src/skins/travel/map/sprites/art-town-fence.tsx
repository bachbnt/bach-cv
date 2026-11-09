/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { fmt } from '@/skins/travel/map/sprites/art-town-math';

/** A low picket fence along a line: `posts` pickets and a rail between (x1, y1) and (x2, y2) on the ground. */
export function PicketFence({
  x1,
  y1,
  x2,
  y2,
  posts,
  stroke,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  posts: number;
  stroke: string;
}) {
  const pickets = Array.from({ length: posts }, (_, i) => {
    const s = i / (posts - 1);
    return `M${fmt(x1 + (x2 - x1) * s)} ${fmt(y1 + (y2 - y1) * s)}v-5`;
  });
  return (
    <path
      d={`${pickets.join('')}M${x1} ${y1 - 3.2}L${x2} ${y2 - 3.2}`}
      className={`fill-none ${stroke}`}
      strokeWidth={1.3}
      strokeLinecap='round'
    />
  );
}
