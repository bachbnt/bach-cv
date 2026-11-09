/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { memo } from 'react';
import {
  CITY,
  PALMS,
  RIVERS,
  ROADS_MAJOR,
  ROADS_MINOR,
} from '@/skins/travel/map/geo';
import {
  crowdsSight,
  squashHeight,
  standsOnWay,
  type Way,
} from '@/skins/travel/map/city-shape';
import { ROUTE_ROAD } from '@/skins/travel/map/route';
import { pathSegments, polylineSegments } from '@/skins/travel/map/segments';
import { toWorld, worldOf, WORLD } from '@/skins/travel/map/iso';
import { SIGHTS } from '@/skins/travel/map/sights';

interface Box {
  key: string;
  roof: string;
  left: string;
  right: string;
  tall: boolean;
  depth: number;
  tone: 0 | 1;
}

const fmt = (list: readonly { x: number; y: number }[]) =>
  list.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

/** A building is the footprint standing up: its roof is the footprint lifted by the height, its two visible walls hang under it. */
function box([x, y, w, d, rawHeight, ang, tone]: readonly number[]): Box {
  const h = squashHeight(rawHeight);
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
    tall: h > 36,
    depth: base.y,
    tone: tone === 0 ? 0 : 1,
  };
}

/** Two kinds of walls, glass and concrete and stone: more colours made the streets busy (the sand-coloured houses are stone now). */
const TONES = [
  { left: 'fill-tl-bldg-l', right: 'fill-tl-bldg-r', top: 'fill-tl-bldg-top' },
  { left: 'fill-tl-stone', right: 'fill-tl-rock-2', top: 'fill-tl-wall' },
] as const;

/** Where the sights stand: no building is drawn on the ground around them. */
const SPOTS = SIGHTS.map((sight) => {
  const w = worldOf(sight.lat, sight.lng);
  return { x: w.x, y: w.y, scale: sight.scale };
});

/** The ways the ground draws (`ground.tsx`), at half the width of their strokes: no building stands on them. */
const WAYS: readonly Way[] = [
  { segments: pathSegments(ROADS_MAJOR), halfWidth: 7.5 },
  { segments: pathSegments(ROADS_MINOR), halfWidth: 3.5 },
  { segments: pathSegments(RIVERS), halfWidth: 4.5 },
  { segments: polylineSegments(ROUTE_ROAD), halfWidth: 7.5 },
];

const BOXES = CITY.filter(
  (row) =>
    !standsOnWay(row, WAYS) &&
    !crowdsSight(toWorld({ x: row[0], y: row[1] }), SPOTS),
)
  .map(box)
  .sort((a, b) => a.depth - b.depth);
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
