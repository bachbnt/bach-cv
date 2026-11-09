/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import {
  topCorners,
  type BoxShape,
} from '@/skins/travel/map/sprites/art-parts';

/**
 * Courses of tiles on the sloping side of a gable `Roof` (the one that faces right): lines parallel to the ridge, at the given
 * shares of the way from the eave to the ridge, as one path.
 */
export function roofLines(shape: BoxShape, rise: number, shares: number[]) {
  const t = topCorners(shape);
  const mx = (t.a[0] + t.c[0]) / 2;
  const my = (t.a[1] + t.c[1]) / 2;
  const r1 = [mx - shape.wr / 2, my + shape.wr / 4 - rise];
  const r2 = [mx + shape.wr / 2, my - shape.wr / 4 - rise];
  return shares
    .map((s) => {
      const x1 = t.b[0] + (r1[0] - t.b[0]) * s;
      const y1 = t.b[1] + (r1[1] - t.b[1]) * s;
      const x2 = t.c[0] + (r2[0] - t.c[0]) * s;
      const y2 = t.c[1] + (r2[1] - t.c[1]) * s;
      return `M${x1} ${y1}L${x2} ${y2}`;
    })
    .join('');
}
