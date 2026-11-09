/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { COAST_ROAD } from '@/skins/travel/map/geo';
import type { Plane } from '@/skins/travel/map/projection';

/**
 * The route of the trip is the real coast road of Nha Trang (Tran Phu street, then Pham Van Dong road) from south to north, taken from
 * OpenStreetMap. A stop is a place on it: the first place of the career in the south, the current one in the north.
 */
/**
 * Where the coast road goes on to the north-east, past the end of `COAST_ROAD`: the next points of Pham Van Dong road from OpenStreetMap,
 * up to the foot of Co Tien mountain. The last pin (the current job) stands there instead of among the beach pins.
 */
const NORTH_ROAD: readonly (readonly [number, number])[] = [
  [1699, 2185],
  [1731, 2153],
  [1746, 2148],
  [1806, 2122],
];

/** The whole road of the trip, from the south end to the foot of Co Tien mountain. */
export const ROUTE_ROAD: readonly (readonly [number, number])[] = [
  ...COAST_ROAD,
  ...NORTH_ROAD,
];
const ROAD: readonly Plane[] = ROUTE_ROAD.map(([x, y]) => ({ x, y }));
const CUMULATIVE: readonly number[] = ROAD.reduce<number[]>((acc, p, i) => {
  acc.push(
    i === 0
      ? 0
      : acc[i - 1] + Math.hypot(p.x - ROAD[i - 1].x, p.y - ROAD[i - 1].y),
  );
  return acc;
}, []);
export const ROUTE_LENGTH = CUMULATIVE[CUMULATIVE.length - 1];

/** The point at `t` (0 at the south end, 1 at the north end), and the direction of the road there. */
export function pointAt(t: number): Plane & { dx: number; dy: number } {
  const d = Math.min(1, Math.max(0, t)) * ROUTE_LENGTH;
  let i = 1;
  while (i < CUMULATIVE.length - 1 && CUMULATIVE[i] < d) i += 1;
  const a = ROAD[i - 1];
  const b = ROAD[i];
  const span = CUMULATIVE[i] - CUMULATIVE[i - 1] || 1;
  const k = (d - CUMULATIVE[i - 1]) / span;
  const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
  return {
    x: a.x + (b.x - a.x) * k,
    y: a.y + (b.y - a.y) * k,
    dx: (b.x - a.x) / len,
    dy: (b.y - a.y) / len,
  };
}

/** The road between two positions, as points (for the dashed line and for the travelling marker). */
export function roadBetween(from: number, to: number): Plane[] {
  const lo = Math.min(from, to);
  const hi = Math.max(from, to);
  const inside = ROAD.filter(
    (_, i) =>
      CUMULATIVE[i] > lo * ROUTE_LENGTH && CUMULATIVE[i] < hi * ROUTE_LENGTH,
  );
  const points = [pointAt(lo), ...inside, pointAt(hi)].map(({ x, y }) => ({
    x,
    y,
  }));
  return from <= to ? points : points.reverse();
}

/** How far a side trip leaves the road, toward the hills (inland): enough to read as a spur on the map. */
const SPUR = 190;
/** The ends of the route are left free so the first and the last pin do not sit on the edge of the beach. */
const MARGIN = 0.05;

interface StopSlot {
  id: string;
  side: boolean;
}
export interface PlacedStop extends StopSlot {
  /** 0 to 1 along the road. */
  t: number;
  at: Plane;
  /** The point on the road a side trip leaves from (the stop itself for the main road). */
  from: Plane;
}

/**
 * The rule that gives every stop a real place: the stops on the main road are spaced evenly along the coast road, in the order of
 * the career (first in the south, current in the north). A side trip leaves the road at the main stop before it and ends on a spur
 * toward the hills.
 */
export function placeStops(stops: readonly StopSlot[]): PlacedStop[] {
  const main = stops.filter((s) => !s.side);
  const spacing = (index: number) =>
    main.length < 2
      ? 0.5
      : MARGIN + (1 - 2 * MARGIN) * (index / (main.length - 1));
  const placed: PlacedStop[] = [];
  let lastMain = 0;
  let mainIndex = -1;
  for (const stop of stops) {
    if (!stop.side) {
      mainIndex += 1;
      lastMain = spacing(mainIndex);
      const p = pointAt(lastMain);
      placed.push({ ...stop, t: lastMain, at: p, from: p });
      continue;
    }
    // a little past the main stop it follows, so the spur and the pin do not sit on the main pin
    const t = Math.min(
      1 - MARGIN,
      lastMain + (main.length < 2 ? 0 : 0.5 / (main.length - 1)),
    );
    const p = pointAt(t);
    // of the two normals of the road, the one that points inland (west)
    const inland = -p.dy < p.dy ? { x: -p.dy, y: p.dx } : { x: p.dy, y: -p.dx };
    placed.push({
      ...stop,
      t,
      from: { x: p.x, y: p.y },
      at: { x: p.x + inland.x * SPUR, y: p.y + inland.y * SPUR },
    });
  }
  return placed;
}
