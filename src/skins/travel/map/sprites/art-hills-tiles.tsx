/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import {
  topCorners,
  type BoxShape,
} from '@/skins/travel/map/sprites/art-parts';

/** Rows of glazed tiles on the front slope of a `Roof` with the same shape and rise (a hip roof: the ridge is shorter than the eaves). */
export function RoofTiles({
  shape,
  rise,
  rows = 3,
}: {
  shape: BoxShape;
  rise: number;
  rows?: number;
}) {
  const t = topCorners(shape);
  const k = (shape.wr - shape.wl) / (2 * shape.wr);
  const ox = (t.a[0] + t.c[0]) / 2;
  const oy = (t.a[1] + t.c[1]) / 2;
  const r1 = [ox - shape.wr * k, oy + shape.wr * 0.5 * k - rise] as const;
  const r2 = [ox + shape.wr * k, oy - shape.wr * 0.5 * k - rise] as const;
  const lines = Array.from({ length: rows }, (_, i) => {
    const f = (i + 1) / (rows + 1);
    const p = [t.b[0] + (r1[0] - t.b[0]) * f, t.b[1] + (r1[1] - t.b[1]) * f];
    const q = [t.c[0] + (r2[0] - t.c[0]) * f, t.c[1] + (r2[1] - t.c[1]) * f];
    return `M${p[0]} ${p[1]} L${q[0]} ${q[1]}`;
  });
  return (
    <path
      d={lines.join(' ')}
      className='fill-none stroke-tl-soil-2'
      strokeOpacity={0.3}
      strokeWidth={0.7}
    />
  );
}
