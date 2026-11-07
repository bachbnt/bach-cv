/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { memo } from 'react';
import { CITY, PALMS } from '@/skins/travel/map/geo';
import { toWorld, WORLD } from '@/skins/travel/map/iso';

interface Box {
  key: string;
  roof: string;
  left: string;
  right: string;
  tall: boolean;
  depth: number;
  tone: 0 | 1 | 2;
}

const fmt = (list: readonly { x: number; y: number }[]) =>
  list.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

/** A building is the footprint standing up: its roof is the footprint lifted by the height, its two visible walls hang under it. */
function box([x, y, w, d, h, ang, tone]: readonly number[]): Box {
  const a = (ang * 5 * Math.PI) / 180;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  const corners = [
    [-w / 2, -d / 2],
    [w / 2, -d / 2],
    [w / 2, d / 2],
    [-w / 2, d / 2],
  ].map(([ox, oy]) =>
    toWorld({ x: x + ox * cos - oy * sin, y: y + ox * sin + oy * cos }),
  );
  const lowest = corners.reduce(
    (best, p, i) => (p.y > corners[best].y ? i : best),
    0,
  );
  const prev = corners[(lowest + 3) % 4];
  const next = corners[(lowest + 1) % 4];
  const base = corners[lowest];
  const up = (p: { x: number; y: number }) => ({ x: p.x, y: p.y - h });
  const [wl, wr] = prev.x < next.x ? [prev, next] : [next, prev];
  return {
    key: `${x}-${y}`,
    roof: fmt(corners.map(up)),
    left: fmt([wl, base, up(base), up(wl)]),
    right: fmt([base, wr, up(wr), up(base)]),
    tall: h > 44,
    depth: base.y,
    tone: tone === 1 ? 1 : tone === 2 ? 2 : 0,
  };
}

/** Three kinds of walls: glass and concrete, stone, and sand-coloured houses. */
const TONES = [
  { left: 'fill-tl-bldg-l', right: 'fill-tl-bldg-r', top: 'fill-tl-bldg-top' },
  { left: 'fill-tl-stone', right: 'fill-tl-rock-2', top: 'fill-tl-wall' },
  { left: 'fill-tl-sand', right: 'fill-tl-sand-2', top: 'fill-tl-wall' },
] as const;

const BOXES = CITY.map(box).sort((a, b) => a.depth - b.depth);
const TREES = PALMS.map(([x, y]) => toWorld({ x, y })).sort(
  (a, b) => a.y - b.y,
);

/** The city: towers and houses along the real streets, palms along the beach road (decoration, drawn once). */
export const City = memo(function City() {
  return (
    <svg
      aria-hidden='true'
      focusable='false'
      width={WORLD.width}
      height={WORLD.height}
      viewBox={`0 0 ${WORLD.width} ${WORLD.height}`}
      className='absolute top-0 left-0 block overflow-visible'
    >
      <defs>
        <pattern
          id='tl-windows'
          width='9'
          height='9'
          patternUnits='userSpaceOnUse'
        >
          <rect x='2' y='2' width='4' height='4' className='fill-tl-glass' />
        </pattern>
        <g id='tl-palm'>
          <path
            d='M0 0 Q3 -12 1 -24'
            className='fill-none stroke-tl-trunk'
            strokeWidth={2.4}
            strokeLinecap='round'
          />
          <path
            d='M1 -24 q-12 -2 -17 8 q9 -6 17 -4 q-6 -8 -4 -14 q5 6 4 10 q4 -9 12 -10 q-4 6 -8 12 q10 -3 16 4 q-9 -4 -16 -3z'
            className='fill-tl-leaf'
          />
        </g>
      </defs>
      {BOXES.map((b) => (
        <g key={b.key}>
          <polygon points={b.left} className={TONES[b.tone].left} />
          <polygon points={b.right} className={TONES[b.tone].right} />
          <polygon points={b.roof} className={TONES[b.tone].top} />
          {b.tall && (
            <g className='tl-windows' fill='url(#tl-windows)'>
              <polygon points={b.left} />
              <polygon points={b.right} />
            </g>
          )}
        </g>
      ))}
      {TREES.map((p) => (
        <use key={`${p.x}-${p.y}`} href='#tl-palm' x={p.x} y={p.y} />
      ))}
    </svg>
  );
});
