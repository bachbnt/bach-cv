/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { WASH_DARK, WASH_LIGHT } from '@/skins/travel/map/sprites/art-parts';

/** A leafy forest crown seen from the front: a blob lit from the upper left. `tone` is a `fill-tl-*` class, lighter for the crowns in front. */
export function Crown({
  x,
  y,
  r,
  tone = 'fill-tl-leaf',
}: {
  x: number;
  y: number;
  r: number;
  tone?: string;
}) {
  return (
    <g>
      <ellipse cx={x} cy={y} rx={r} ry={r * 0.85} className={tone} />
      <ellipse
        cx={x + r * 0.28}
        cy={y + r * 0.3}
        rx={r * 0.7}
        ry={r * 0.5}
        className={WASH_DARK}
        opacity={0.22}
      />
      <ellipse
        cx={x - r * 0.3}
        cy={y - r * 0.32}
        rx={r * 0.5}
        ry={r * 0.36}
        className={WASH_LIGHT}
        opacity={0.26}
      />
    </g>
  );
}
