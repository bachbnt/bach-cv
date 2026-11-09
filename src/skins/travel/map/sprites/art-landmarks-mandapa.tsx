/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { roofLines } from '@/skins/travel/map/sprites/art-landmarks-roof-lines';
import { Box, Roof, type BoxShape } from '@/skins/travel/map/sprites/art-parts';

const PLINTH = 3;
const COLUMN_W = 2.2;
/** How far the rear row of columns stands behind the front one. */
const DEPTH = 7;

const pts = (list: readonly (readonly [number, number])[]) =>
  list.map((q) => `${q[0]},${q[1]}`).join(' ');

/** A row of columns along a line from (x0, y0) going `dx` across and `dy` up, as one path. */
function row(
  x0: number,
  y0: number,
  dx: number,
  dy: number,
  n: number,
  h: number,
) {
  const out: string[] = [];
  for (let i = 0; i < n; i += 1) {
    const t = (i + 0.5) / n;
    const x = x0 + dx * t - COLUMN_W / 2;
    const y = y0 + dy * t;
    out.push(`M${x} ${y}v${-h}h${COLUMN_W}v${h}z`);
  }
  return out.join('');
}

/**
 * The porch hall (mandapa) in front of the Cham towers: a low brick plinth, two rows of round columns open to the front, and a
 * tiled gable roof. `shape` is the footprint (its `h` is not used); the hall is `column` tall under the roof.
 */
export function Mandapa({
  shape,
  column,
  rise,
}: {
  shape: BoxShape;
  column: number;
  rise: number;
}) {
  const { cx, y, wl, wr } = shape;
  const base = y - PLINTH;
  const eave: BoxShape = {
    cx,
    y: base,
    wl: wl + 2,
    wr: wr + 2,
    h: column,
  };
  const tiles = roofLines(eave, rise, [0.3, 0.58, 0.82]);
  return (
    <g>
      <Box
        shape={{ ...shape, h: PLINTH }}
        wall='fill-tl-rock-2'
        top='fill-tl-rock-2'
      />
      <polygon
        points={pts([
          [cx - wl, base - wl / 2],
          [cx, base],
          [cx, base - column],
          [cx - wl, base - wl / 2 - column],
        ])}
        className='fill-tl-soil-2'
        opacity={0.86}
      />
      <polygon
        points={pts([
          [cx, base],
          [cx + wr, base - wr / 2],
          [cx + wr, base - wr / 2 - column],
          [cx, base - column],
        ])}
        className='fill-tl-soil-2'
        opacity={0.86}
      />
      <path
        d={row(
          cx - DEPTH,
          base - DEPTH / 2,
          wr,
          -wr / 2,
          Math.round(wr / 6),
          column - 1,
        )}
        className='fill-tl-brick'
        opacity={0.5}
      />
      <path
        d={row(cx - wl, base - wl / 2, wl, wl / 2, Math.round(wl / 6), column)}
        className='fill-tl-brick'
      />
      <path
        d={row(cx, base, wr, -wr / 2, Math.round(wr / 6), column)}
        className='fill-tl-roof'
      />
      <Roof
        shape={eave}
        roof='fill-tl-roof'
        gable
        end='fill-tl-brick'
        rise={rise}
      />
      <path
        d={tiles}
        className='fill-none stroke-tl-soil-2'
        strokeOpacity={0.3}
        strokeWidth={0.6}
      />
    </g>
  );
}
