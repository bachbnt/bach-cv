/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { CLEARINGS } from '@/skins/moba/world/decor';
import {
  BARON_PIT,
  BLUE_BASE,
  DRAGON_PIT,
  LANE_IDS,
  LANES,
  RED_BASE,
  RIVER,
  WORLD,
  dist,
  type Pt,
} from '@/skins/moba/world/geometry';
import { TRAILS } from '@/skins/moba/world/nav';
import { STATIONS } from '@/skins/moba/world/stations';

/*
 * Where the champion can stand. The arena is open, as in the game: the champion walks the lanes, the river, the jungle clearings, the bases
 * and the pits in a straight line, and only the canopy that fills the rest of the map (the walls) stops it. The reaches below are the half
 * widths of what the art draws, a little generous so that a clearing and the lane beside it meet.
 */
const LANE_REACH = 60;
const RIVER_REACH = 80;
const TRAIL_REACH = 24;
const GAP_REACH = 36;
const BASE_REACH = 134;
const PIT_REACH = 96;
const STATION_REACH = 40;
/** The clearing's ellipse is a bit wider than its drawn outline, which wobbles. */
const CLEARING_GROW = 1.08;

type Segment = readonly [Pt, Pt];

const segmentsOf = (line: readonly Pt[]): Segment[] =>
  line.slice(1).map((p, i) => [line[i], p] as const);

const distToSegment = (p: Pt, [a, b]: Segment): number => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;
  const t =
    len2 === 0
      ? 0
      : Math.min(1, Math.max(0, ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
};

const within = (p: Pt, segments: readonly Segment[], reach: number): boolean =>
  segments.some((s) => distToSegment(p, s) <= reach);

const nearestOf = (p: Pt, points: readonly Pt[]): Pt =>
  points.reduce((best, q) => (dist(q, p) < dist(best, p) ? q : best));

const LANE_LINES: Pt[][] = LANE_IDS.map((lane) => LANES[lane].samples);
const LANES_SEGMENTS = LANE_LINES.flatMap(segmentsOf);
const RIVER_SEGMENTS = segmentsOf(RIVER);
const TRAIL_SEGMENTS = TRAILS.flatMap(segmentsOf);
/** The paths through the brush from each clearing to the nearest lane and the nearest bend of the river, so that no clearing is closed. */
const GAP_SEGMENTS: Segment[] = CLEARINGS.flatMap((clearing) =>
  [LANE_LINES.flat(), RIVER].map(
    (line) => [clearing.centre, nearestOf(clearing.centre, line)] as const,
  ),
);
const DISCS: { at: Pt; reach: number }[] = [
  { at: BLUE_BASE, reach: BASE_REACH },
  { at: RED_BASE, reach: BASE_REACH },
  { at: BARON_PIT, reach: PIT_REACH },
  { at: DRAGON_PIT, reach: PIT_REACH },
  ...STATIONS.map((s) => ({ at: s.at, reach: STATION_REACH })),
];

/** Whether the champion can stand at `p`. */
export function isWalkable(p: Pt): boolean {
  if (p.x < 0 || p.y < 0 || p.x > WORLD || p.y > WORLD) return false;
  return (
    within(p, LANES_SEGMENTS, LANE_REACH) ||
    within(p, RIVER_SEGMENTS, RIVER_REACH) ||
    CLEARINGS.some(
      (c) =>
        ((p.x - c.centre.x) / (c.rx * CLEARING_GROW)) ** 2 +
          ((p.y - c.centre.y) / (c.ry * CLEARING_GROW)) ** 2 <=
        1,
    ) ||
    DISCS.some((d) => dist(p, d.at) <= d.reach) ||
    within(p, TRAIL_SEGMENTS, TRAIL_REACH) ||
    within(p, GAP_SEGMENTS, GAP_REACH)
  );
}

/** The grid that the search walks on: a point every `STEP` units, open where the ground is walkable. */
const STEP = 20;
const SIDE = Math.floor(WORLD / STEP) + 1;
let open: Uint8Array | null = null;

const grid = (): Uint8Array => {
  if (open) return open;
  const cells = new Uint8Array(SIDE * SIDE);
  for (let y = 0; y < SIDE; y += 1)
    for (let x = 0; x < SIDE; x += 1)
      cells[y * SIDE + x] = isWalkable({ x: x * STEP, y: y * STEP }) ? 1 : 0;
  open = cells;
  return cells;
};

const pointOf = (cell: number): Pt => ({
  x: (cell % SIDE) * STEP,
  y: Math.floor(cell / SIDE) * STEP,
});

/** The open grid point nearest to `p`. */
function nearestCell(p: Pt): number {
  const cells = grid();
  let best = -1;
  let bestDist = Infinity;
  for (let cell = 0; cell < cells.length; cell += 1) {
    if (!cells[cell]) continue;
    const d = dist(pointOf(cell), p);
    if (d < bestDist) {
      bestDist = d;
      best = cell;
    }
  }
  return best;
}

/** `p` itself when it is walkable, otherwise the nearest walkable place (a click on the canopy walks to its edge). */
export function nearestWalkable(p: Pt): Pt {
  return isWalkable(p) ? p : pointOf(nearestCell(p));
}

/** Whether the straight line between two points stays on walkable ground. */
function clear(a: Pt, b: Pt): boolean {
  const steps = Math.ceil(dist(a, b) / 6);
  for (let i = 1; i < steps; i += 1) {
    const t = i / steps;
    if (!isWalkable({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }))
      return false;
  }
  return true;
}

const NEIGHBOURS: readonly (readonly [number, number])[] = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
];

/** A* over the open grid points, from cell `from` to cell `to`: the cells in order, or `null` when `to` cannot be reached. */
function search(from: number, to: number): number[] | null {
  const cells = grid();
  const goal = pointOf(to);
  const cost = new Float32Array(cells.length).fill(Infinity);
  const before = new Int32Array(cells.length).fill(-1);
  const queue: { cell: number; score: number }[] = [];
  const push = (cell: number, score: number) => {
    queue.push({ cell, score });
    let i = queue.length - 1;
    while (i > 0) {
      const up = (i - 1) >> 1;
      if (queue[up].score <= queue[i].score) break;
      [queue[up], queue[i]] = [queue[i], queue[up]];
      i = up;
    }
  };
  const pop = () => {
    const top = queue[0];
    const last = queue.pop();
    if (queue.length > 0 && last) {
      queue[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1;
        const r = l + 1;
        let low = i;
        if (l < queue.length && queue[l].score < queue[low].score) low = l;
        if (r < queue.length && queue[r].score < queue[low].score) low = r;
        if (low === i) break;
        [queue[low], queue[i]] = [queue[i], queue[low]];
        i = low;
      }
    }
    return top;
  };
  cost[from] = 0;
  push(from, dist(pointOf(from), goal));
  while (queue.length > 0) {
    const { cell } = pop();
    if (cell === to) break;
    const cx = cell % SIDE;
    const cy = Math.floor(cell / SIDE);
    for (const [dx, dy] of NEIGHBOURS) {
      const x = cx + dx;
      const y = cy + dy;
      if (x < 0 || y < 0 || x >= SIDE || y >= SIDE) continue;
      const next = y * SIDE + x;
      if (!cells[next]) continue;
      // a diagonal step may not cut the corner of a wall
      if (
        dx !== 0 &&
        dy !== 0 &&
        (!cells[cy * SIDE + x] || !cells[y * SIDE + cx])
      )
        continue;
      const through =
        cost[cell] + (dx !== 0 && dy !== 0 ? STEP * Math.SQRT2 : STEP);
      if (through < cost[next]) {
        cost[next] = through;
        before[next] = cell;
        push(next, through + dist(pointOf(next), goal));
      }
    }
  }
  if (!Number.isFinite(cost[to])) return null;
  const found: number[] = [];
  for (let cell = to; cell >= 0; cell = before[cell]) found.push(cell);
  return found.reverse();
}

/** Drops the points of a walk that the straight line can skip, so the champion cuts across the jungle instead of following the grid. */
function pull(path: Pt[]): Pt[] {
  const out = [path[0]];
  let i = 0;
  while (i < path.length - 1) {
    let j = path.length - 1;
    while (j > i + 1 && !clear(path[i], path[j])) j -= 1;
    out.push(path[j]);
    i = j;
  }
  return out;
}

/**
 * The walk from `from` to `to` as a polyline that stays on walkable ground and cuts straight across it where it can: through the river
 * and the jungle, not along the lanes. A target on the canopy is moved to the nearest walkable place.
 */
export function routeTo(from: Pt, to: Pt): Pt[] {
  const goal = nearestWalkable(to);
  if (clear(from, goal)) return dist(from, goal) < 0.01 ? [from] : [from, goal];
  const cells = search(nearestCell(from), nearestCell(goal));
  if (!cells) return [from, goal];
  return pull([from, ...cells.map(pointOf), goal]).filter(
    (p, i, all) => i === 0 || dist(p, all[i - 1]) > 0.01,
  );
}

/**
 * Walking by hand: the champion goes by `move` when that ground is walkable, otherwise it slides along the wall on the axis that is
 * free, and it stays where it is when both are blocked.
 */
export function slide(from: Pt, move: Pt): Pt {
  const full = { x: from.x + move.x, y: from.y + move.y };
  if (isWalkable(full)) return full;
  const alongX = { x: full.x, y: from.y };
  if (move.x !== 0 && isWalkable(alongX)) return alongX;
  const alongY = { x: from.x, y: full.y };
  if (move.y !== 0 && isWalkable(alongY)) return alongY;
  return from;
}
