/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import {
  topCorners,
  type BoxShape,
} from '@/skins/travel/map/sprites/art-parts';
import { lerp, pt, type Pt } from '@/skins/travel/map/sprites/art-town-math';

const ROWS = [0.2, 0.4, 0.6, 0.8];

/** Rows of tiles on the two visible slopes of a `Roof` hip (the roof of art-parts has none). */
export function RoofTiles({ shape, rise }: { shape: BoxShape; rise: number }) {
  const t = topCorners(shape);
  const k = (shape.wr - shape.wl) / (2 * shape.wr);
  const ox = (t.a[0] + t.c[0]) / 2;
  const oy = (t.a[1] + t.c[1]) / 2;
  const r1: Pt = [ox - shape.wr * k, oy + shape.wr * 0.5 * k - rise];
  const r2: Pt = [ox + shape.wr * k, oy - shape.wr * 0.5 * k - rise];
  const left = ROWS.map(
    (s) => `M${pt(lerp(t.a, r1, s))}L${pt(lerp(t.b, r1, s))}`,
  );
  const right = ROWS.map(
    (s) => `M${pt(lerp(t.b, r1, s))}L${pt(lerp(t.c, r2, s))}`,
  );
  return (
    <g
      className='fill-none stroke-tl-soil-2'
      strokeWidth={0.7}
      strokeOpacity={0.24}
    >
      <path d={left.join('')} />
      <path d={right.join('')} />
    </g>
  );
}
