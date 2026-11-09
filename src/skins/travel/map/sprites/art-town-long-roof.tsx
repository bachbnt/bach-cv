/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import {
  topCorners,
  WASH_DARK,
  WASH_LIGHT,
  type BoxShape,
} from '@/skins/travel/map/sprites/art-parts';
import { lerp, pt, type Pt } from '@/skins/travel/map/sprites/art-town-math';

const ROWS = [0.2, 0.4, 0.6, 0.8];

/**
 * A hip roof over a box whose lit face is the long one (`wl > wr`): the ridge runs along the left face, the visible short end is
 * a hip. `Roof` of art-parts only does the opposite proportion.
 */
export function LongHipRoof({
  shape,
  roof,
  rise,
}: {
  shape: BoxShape;
  roof: string;
  rise: number;
}) {
  const { a, b, c, d } = topCorners(shape);
  const half = (shape.wl - shape.wr) / 2;
  const ox = (a[0] + c[0]) / 2;
  const oy = (a[1] + c[1]) / 2;
  const ra: Pt = [ox - half, oy - half / 2 - rise];
  const rb: Pt = [ox + half, oy + half / 2 - rise];
  const slope = `M${pt(a)}L${pt(b)}L${pt(rb)}L${pt(ra)}z`;
  const hip = `M${pt(b)}L${pt(c)}L${pt(rb)}z`;
  const rows = ROWS.map((s) => `M${pt(lerp(a, ra, s))}L${pt(lerp(b, rb, s))}`);
  const hipRows = ROWS.map(
    (s) => `M${pt(lerp(b, rb, s))}L${pt(lerp(c, rb, s))}`,
  );
  return (
    <g>
      <path
        d={`M${pt(a)}L${pt(d)}L${pt(c)}L${pt(rb)}L${pt(ra)}z`}
        className={roof}
      />
      <path
        d={`M${pt(a)}L${pt(d)}L${pt(c)}L${pt(rb)}L${pt(ra)}z`}
        className={WASH_DARK}
        opacity={0.18}
      />
      <path d={slope} className={roof} />
      <path d={slope} className={WASH_LIGHT} opacity={0.14} />
      <path d={hip} className={roof} />
      <path d={hip} className={WASH_DARK} opacity={0.26} />
      <path
        d={rows.join('') + hipRows.join('')}
        className='fill-none stroke-tl-soil-2'
        strokeWidth={0.7}
        strokeOpacity={0.24}
      />
      <polyline
        points={`${pt(a)} ${pt(ra)} ${pt(rb)} ${pt(b)}`}
        className='fill-none stroke-tl-soil-2'
        strokeOpacity={0.3}
        strokeWidth={0.8}
        strokeLinejoin='round'
      />
      <polyline
        points={`${pt(a)} ${pt(b)} ${pt(c)}`}
        className='fill-none stroke-tl-soil-2'
        strokeOpacity={0.35}
        strokeWidth={1.2}
        strokeLinejoin='round'
      />
    </g>
  );
}
