/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { COAST_ROAD } from '@/skins/travel/map/geo';
import { project, type Plane } from '@/skins/travel/map/projection';

/**
 * The route of the trip is the real coast road of Nha Trang (Tran Phu street, then Pham Van Dong road) from south to north, taken from
 * OpenStreetMap. A stop is a place on it: the first place of the career in the south, the current one in the north.
 */
/**
 * Where the coast road goes on to the north-east, past the end of `COAST_ROAD`: the next points of Pham Van Dong road from OpenStreetMap, beside
 * Co Tien mountain and on to the Do Theatre. The last pin (the current job) stands at its end, apart from the beach pins.
 */
const NORTH_ROAD: readonly (readonly [number, number])[] = [
  [1699, 2185],
  [1731, 2153],
  [1746, 2148],
  [1806, 2122],
  [1849, 2076],
  [1879, 2056],
  [1920, 2052],
  [2034, 2101],
  [2077, 2092],
  [2144, 2110],
  [2224, 2087],
];

/** The whole road of the trip, from the south end to the Do Theatre. */
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

/** How far a side trip leaves the road, toward the hills (inland), when it has no place of its own: enough to read as a spur on the map. */
const SPUR = 190;
/** The ends of the route are left free so the first and the last pin do not sit on the edge of the beach (only for more stops than places). */
const MARGIN = 0.05;

/**
 * Where the stops of the main road stand, as a place along the road (0 south, 1 north): stretches of the road with no sight beside them, so
 * the cards of the pins and the names of the sights do not cover each other. Two in the empty south, one across the Cai River (north of Hon
 * Chong, past the sandbank of the houses) and the last at the end of the road, beside the Do Theatre, where the current job stands. They are
 * said as a length of road from the south end (in the units of the map), so a longer road does not move them. A test keeps all but the last
 * clear of every sight.
 */
export const MAIN_PLACES: readonly number[] = [
  ...[383, 639, 1790].map((length) => length / ROUTE_LENGTH),
  1,
];
/** Where a side trip stands: the sandbank of the Cai River beside Po Nagar (Hon Cau), in the houses of the city. A further side trip takes a spur. */
const SIDE_PLACES: readonly Plane[] = [project(12.2631, 109.1966)];

/** The point of the road nearest to a place, and how far along the road (0 to 1) it is. */
function roadPointNear(place: Plane): { t: number; point: Plane } {
  let best = { t: 0, point: ROAD[0], d: Infinity };
  for (let i = 1; i < ROAD.length; i += 1) {
    const a = ROAD[i - 1];
    const b = ROAD[i];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const span = dx * dx + dy * dy || 1;
    const k = Math.max(
      0,
      Math.min(1, ((place.x - a.x) * dx + (place.y - a.y) * dy) / span),
    );
    const point = { x: a.x + dx * k, y: a.y + dy * k };
    const d = Math.hypot(place.x - point.x, place.y - point.y);
    if (d < best.d) {
      const along = CUMULATIVE[i - 1] + (CUMULATIVE[i] - CUMULATIVE[i - 1]) * k;
      best = { t: along / ROUTE_LENGTH, point, d };
    }
  }
  return { t: best.t, point: best.point };
}

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
 * The rule that gives every stop a real place. The stops of the main road take the places of `MAIN_PLACES` in the order of the career (first
 * in the south, current beside the Do Theatre); with fewer stops than places they are spread over them, with more they are spaced evenly
 * along the road. A side trip takes a place of `SIDE_PLACES`, joined to the road where it is nearest, and a spur toward the hills when
 * those are taken.
 */
export function placeStops(stops: readonly StopSlot[]): PlacedStop[] {
  const main = stops.filter((s) => !s.side);
  const last = MAIN_PLACES.length - 1;
  const spacing = (index: number) => {
    if (main.length > MAIN_PLACES.length)
      return MARGIN + (1 - 2 * MARGIN) * (index / (main.length - 1));
    if (main.length < 2) return MAIN_PLACES[last];
    return MAIN_PLACES[Math.round((index * last) / (main.length - 1))];
  };
  const placed: PlacedStop[] = [];
  let lastMain = 0;
  let mainIndex = -1;
  let sideIndex = -1;
  for (const stop of stops) {
    if (!stop.side) {
      mainIndex += 1;
      lastMain = spacing(mainIndex);
      const p = pointAt(lastMain);
      placed.push({ ...stop, t: lastMain, at: p, from: p });
      continue;
    }
    sideIndex += 1;
    const home = SIDE_PLACES[sideIndex];
    if (home) {
      const near = roadPointNear(home);
      placed.push({ ...stop, t: near.t, from: near.point, at: home });
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

/**
 * The way to a stop along the real road, from the stop before it (from the south end of the road for the first one): the spur back to the
 * road when the stop before is a side trip, the road itself, then the spur out to the stop when it is a side trip.
 */
export function tripPath(from: PlacedStop | null, to: PlacedStop): Plane[] {
  const out: Plane[] = [];
  if (from?.side) out.push(from.at, from.from);
  out.push(...roadBetween(from?.t ?? 0, to.t));
  if (to.side) out.push(to.at);
  return out.length > 1 ? out : [from?.at ?? pointAt(0), to.at];
}
