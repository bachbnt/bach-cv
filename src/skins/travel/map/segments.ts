/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

export interface Segment {
  ax: number;
  ay: number;
  bx: number;
  by: number;
}

/** The segments of an SVG path made only of `M` and `l` commands (what the map data uses); the pairs of a command run on. */
export function pathSegments(d: string): Segment[] {
  const out: Segment[] = [];
  let x = 0;
  let y = 0;
  for (const [, command, args] of d.matchAll(/([Ml])([^Ml]*)/g)) {
    const numbers = (args.match(/-?\d*\.?\d+/g) ?? []).map(Number);
    for (let i = 0; i + 1 < numbers.length; i += 2) {
      const first = command === 'M' && i === 0;
      const nx = command === 'M' ? numbers[i] : x + numbers[i];
      const ny = command === 'M' ? numbers[i + 1] : y + numbers[i + 1];
      if (!first) out.push({ ax: x, ay: y, bx: nx, by: ny });
      x = nx;
      y = ny;
    }
  }
  return out;
}

/** The segments of a polyline given as points. */
export const polylineSegments = (
  points: readonly (readonly [number, number])[],
): Segment[] =>
  points.slice(1).map(([bx, by], i) => ({
    ax: points[i][0],
    ay: points[i][1],
    bx,
    by,
  }));

/** The distance from a point to the nearest of the segments (Infinity for none). */
export function distanceToSegments(
  x: number,
  y: number,
  segments: readonly Segment[],
): number {
  let best = Infinity;
  for (const { ax, ay, bx, by } of segments) {
    const dx = bx - ax;
    const dy = by - ay;
    const length = dx * dx + dy * dy;
    const t =
      length === 0
        ? 0
        : Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / length));
    best = Math.min(best, Math.hypot(x - (ax + t * dx), y - (ay + t * dy)));
  }
  return best;
}
