/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

export interface Pt {
  x: number;
  y: number;
}

/** The map is a square of this many units; every position below is in them. */
export const WORLD = 1200;

export const dist = (a: Pt, b: Pt): number => Math.hypot(a.x - b.x, a.y - b.y);

/** The same place seen from the other team: the map is symmetric by a half turn around its centre. */
export const mirror = (p: Pt): Pt => ({ x: WORLD - p.x, y: WORLD - p.y });

export const lerp = (a: Pt, b: Pt, t: number): Pt => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
});

const round = (n: number): number => Math.round(n * 10) / 10;

/** How far apart the points of a sampled line are, at most: the nav graph and the walking follow these points. */
const STEP = 36;
const CURVE_STEPS = 8;

export interface Outline {
  /** the SVG path data, with rounded corners */
  d: string;
  /** the same line as points (curves cut into short pieces), for walking and for the navigation graph */
  samples: Pt[];
}

/** A polyline with its corners rounded by quadratic curves of at most `radius`. */
export function roundedLine(points: Pt[], radius: number): Outline {
  const samples: Pt[] = [points[0]];
  const parts: string[] = [`M${points[0].x} ${points[0].y}`];
  const lineTo = (to: Pt) => {
    const from = samples[samples.length - 1];
    const n = Math.max(1, Math.ceil(dist(from, to) / STEP));
    for (let i = 1; i <= n; i += 1) samples.push(lerp(from, to, i / n));
  };
  for (let i = 1; i < points.length - 1; i += 1) {
    const a = points[i - 1];
    const b = points[i];
    const c = points[i + 1];
    const r = Math.min(radius, dist(a, b) / 2, dist(b, c) / 2);
    const p1 = lerp(b, a, r / dist(a, b));
    const p2 = lerp(b, c, r / dist(b, c));
    parts.push(
      `L${round(p1.x)} ${round(p1.y)}`,
      `Q${b.x} ${b.y} ${round(p2.x)} ${round(p2.y)}`,
    );
    lineTo(p1);
    for (let k = 1; k <= CURVE_STEPS; k += 1) {
      const t = k / CURVE_STEPS;
      const u = 1 - t;
      samples.push({
        x: u * u * p1.x + 2 * u * t * b.x + t * t * p2.x,
        y: u * u * p1.y + 2 * u * t * b.y + t * t * p2.y,
      });
    }
  }
  const last = points[points.length - 1];
  parts.push(`L${last.x} ${last.y}`);
  lineTo(last);
  return { d: parts.join(' '), samples };
}

export const lengthOf = (line: Pt[]): number => {
  let total = 0;
  for (let i = 1; i < line.length; i += 1) total += dist(line[i - 1], line[i]);
  return total;
};

/** The point a `fraction` (0 to 1) of the way along a line, by length. */
export function pointAlong(line: Pt[], fraction: number): Pt {
  const target = Math.min(1, Math.max(0, fraction)) * lengthOf(line);
  let walked = 0;
  for (let i = 1; i < line.length; i += 1) {
    const step = dist(line[i - 1], line[i]);
    if (walked + step >= target) {
      return lerp(
        line[i - 1],
        line[i],
        step === 0 ? 0 : (target - walked) / step,
      );
    }
    walked += step;
  }
  return line[line.length - 1];
}

export type LaneId = 'top' | 'mid' | 'bot';
export const LANE_IDS: LaneId[] = ['top', 'mid', 'bot'];

/** Where the blue base is; the red base is its mirror. */
export const BLUE_BASE: Pt = { x: 165, y: 1035 };
export const RED_BASE: Pt = mirror(BLUE_BASE);
/** Where the champion spawns: the fountain pad on the blue plate, off to one side of the nexus. */
export const FOUNTAIN_PAD: Pt = { x: 112, y: 1084 };

/**
 * The three lanes, from the blue end to the red end. Top runs along the left and top edges, bot along the bottom and right edges, mid
 * along the diagonal between the bases (the river crosses it at the centre).
 */
const LANE_POINTS: Record<LaneId, Pt[]> = {
  top: [
    { x: 118, y: 940 },
    { x: 118, y: 118 },
    { x: 940, y: 118 },
  ],
  mid: [
    { x: 250, y: 950 },
    { x: 950, y: 250 },
  ],
  bot: [
    { x: 260, y: 1082 },
    { x: 1082, y: 1082 },
    { x: 1082, y: 260 },
  ],
};
const LANE_RADIUS = 100;

export const LANES: Record<LaneId, Outline> = {
  top: roundedLine(LANE_POINTS.top, LANE_RADIUS),
  mid: roundedLine(LANE_POINTS.mid, 0),
  bot: roundedLine(LANE_POINTS.bot, LANE_RADIUS),
};

/**
 * The river: it crosses the map from the top-left corner to the bottom-right one and cuts the mid lane at the centre. The line is
 * the diagonal with a gentle wave, so it reads as a river and not as a road; the pits sit on it.
 */
export function riverLine(): Pt[] {
  const points: Pt[] = [];
  const n = 36;
  for (let i = 0; i <= n; i += 1) {
    const s = i / n;
    // the wave dies out at the ends, at the pits and at the centre, so those stay on the exact diagonal
    const wave =
      34 *
      Math.sin(s * Math.PI * 6) *
      (0.35 + 0.65 * Math.abs(Math.sin(s * Math.PI * 2)));
    const base = s * WORLD;
    points.push({ x: base + wave * 0.707, y: base - wave * 0.707 });
  }
  return points;
}

export const RIVER: Pt[] = riverLine();

/** Where the two objective pits are: the baron pit on the upper half of the river, the dragon pit on the lower. */
export const BARON_PIT: Pt = { x: 330, y: 330 };
export const DRAGON_PIT: Pt = mirror(BARON_PIT);

/** The towers that stand on a lane of each side, as a fraction of the lane from the blue end (outer, inner, inhibitor). */
export const BLUE_TOWER_FRACTIONS = [0.4, 0.26, 0.12] as const;

export interface Tower {
  id: string;
  at: Pt;
  team: 'blue' | 'red';
  kind: 'outer' | 'inner' | 'inhibitor' | 'nexus';
}

/**
 * The towers that are decoration: three on each lane for the blue side, and for the red side on top and bot (the red mid lane holds
 * the career instead: see `roleTowerSpots`). Two more guard each nexus.
 */
export function decorTowers(): Tower[] {
  const kinds = ['outer', 'inner', 'inhibitor'] as const;
  const towers: Tower[] = [];
  for (const lane of LANE_IDS) {
    BLUE_TOWER_FRACTIONS.forEach((f, i) => {
      const at = pointAlong(LANES[lane].samples, f);
      towers.push({
        id: `blue-${lane}-${kinds[i]}`,
        at,
        team: 'blue',
        kind: kinds[i],
      });
      if (lane !== 'mid')
        towers.push({
          id: `red-${lane}-${kinds[i]}`,
          at: mirror(at),
          team: 'red',
          kind: kinds[i],
        });
    });
  }
  const guards: Pt[] = [
    { x: 92, y: -58 },
    { x: 56, y: -94 },
  ];
  guards.forEach((offset, i) => {
    const at = { x: BLUE_BASE.x + offset.x, y: BLUE_BASE.y + offset.y };
    towers.push({ id: `blue-nexus-${i}`, at, team: 'blue', kind: 'nexus' });
    towers.push({
      id: `red-nexus-${i}`,
      at: mirror(at),
      team: 'red',
      kind: 'nexus',
    });
  });
  return towers;
}

/** Where the towers of the career stand: along the red half of the mid lane, the first role nearest the river. */
export function roleTowerSpots(count: number): Pt[] {
  if (count <= 0) return [];
  const from = 0.6;
  const to = 0.88;
  return Array.from({ length: count }, (_, i) =>
    pointAlong(
      LANES.mid.samples,
      count === 1 ? (from + to) / 2 : from + ((to - from) * i) / (count - 1),
    ),
  );
}

/** The inhibitors: one on each lane near each base. */
export function inhibitors(): { id: string; at: Pt; team: 'blue' | 'red' }[] {
  return LANE_IDS.flatMap((lane) => {
    const at = pointAlong(LANES[lane].samples, 0.055);
    return [
      { id: `blue-${lane}-inhibitor-crystal`, at, team: 'blue' as const },
      {
        id: `red-${lane}-inhibitor-crystal`,
        at: mirror(at),
        team: 'red' as const,
      },
    ];
  });
}

/** A small seeded random generator (the same map on every visit and in every test). */
export function seeded(seed: number): () => number {
  let state = seed >>> 0 || 1;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}
