/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { WORLD, dist, type Pt } from '@/skins/moba/world/geometry';

/** What a key skill does when it is cast: only the look of the cast differs, every cast is a show over the map. */
export type CastKind = 'bolt' | 'aura' | 'dash' | 'nova';

export interface CastSpec {
  kind: CastKind;
  /** how far the cast reaches, in map units (0: it stays on the champion) */
  range: number;
  cooldownMs: number;
}

/** Q is a bolt thrown at the pointer, W a ring around the champion, E a dash toward the pointer and R a wave that reveals the map. */
export const CASTS: readonly [CastSpec, CastSpec, CastSpec, CastSpec] = [
  { kind: 'bolt', range: 420, cooldownMs: 2500 },
  { kind: 'aura', range: 0, cooldownMs: 5000 },
  { kind: 'dash', range: 260, cooldownMs: 4000 },
  { kind: 'nova', range: 0, cooldownMs: 10000 },
];

/** How far the wave of R sees, in map units: the fog of war clears inside this radius. */
export const NOVA_RADIUS = 520;

export interface Aim {
  to: Pt;
  /** the direction of the cast, in radians (0 points to the right) */
  angle: number;
  /** the distance from the champion to `to` */
  length: number;
}

const clampToWorld = (p: Pt): Pt => ({
  x: Math.min(WORLD, Math.max(0, p.x)),
  y: Math.min(WORLD, Math.max(0, p.y)),
});

/**
 * Where a cast of `range` lands when it is aimed at `at`: the aim itself when it is close enough, otherwise the point at `range` on the
 * line to it. With no aim (the pointer has not been over the map yet) the cast goes to the right.
 */
export function aimFrom(from: Pt, at: Pt | null, range: number): Aim {
  const dx = at ? at.x - from.x : 1;
  const dy = at ? at.y - from.y : 0;
  const distance = Math.hypot(dx, dy);
  const angle = distance > 0 ? Math.atan2(dy, dx) : 0;
  const length = at && distance > 0 ? Math.min(distance, range) : range;
  const to = clampToWorld({
    x: from.x + Math.cos(angle) * length,
    y: from.y + Math.sin(angle) * length,
  });
  return { to, angle, length: dist(from, to) };
}

/** The map cells (as `x,y` indexes of a grid of `cell` units) whose centres are within `radius` of `at`, for the wave that reveals them. */
export function cellsAround(at: Pt, radius: number, cell: number): string[] {
  const found: string[] = [];
  const from = (v: number) => Math.floor((v - radius) / cell);
  const to = (v: number) => Math.floor((v + radius) / cell);
  for (let x = from(at.x); x <= to(at.x); x++)
    for (let y = from(at.y); y <= to(at.y); y++) {
      if (x < 0 || y < 0) continue;
      const centre = { x: (x + 0.5) * cell, y: (y + 0.5) * cell };
      if (centre.x <= WORLD && centre.y <= WORLD && dist(centre, at) <= radius)
        found.push(`${x},${y}`);
    }
  return found;
}
