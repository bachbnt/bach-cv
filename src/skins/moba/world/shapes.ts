/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { seeded, type Pt } from '@/skins/moba/world/geometry';

const fix = (n: number): string => String(Math.round(n * 10) / 10);

/** A closed smooth curve through the points (a Catmull-Rom spline written as cubic curves). */
export function smoothClosed(points: Pt[]): string {
  const n = points.length;
  const parts = [`M${fix(points[0].x)} ${fix(points[0].y)}`];
  for (let i = 0; i < n; i += 1) {
    const p0 = points[(i + n - 1) % n];
    const p1 = points[i];
    const p2 = points[(i + 1) % n];
    const p3 = points[(i + 2) % n];
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    parts.push(
      `C${fix(c1.x)} ${fix(c1.y)} ${fix(c2.x)} ${fix(c2.y)} ${fix(p2.x)} ${fix(p2.y)}`,
    );
  }
  return `${parts.join(' ')}Z`;
}

/** An open smooth curve through the points (the river). */
export function smoothOpen(points: Pt[]): string {
  const n = points.length;
  const parts = [`M${fix(points[0].x)} ${fix(points[0].y)}`];
  for (let i = 0; i < n - 1; i += 1) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(n - 1, i + 2)];
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    parts.push(
      `C${fix(c1.x)} ${fix(c1.y)} ${fix(c2.x)} ${fix(c2.y)} ${fix(p2.x)} ${fix(p2.y)}`,
    );
  }
  return parts.join(' ');
}

/** An irregular rounded shape around a centre, the same for the same seed: the outline of a clearing or a patch of brush. */
export function blobPath(
  centre: Pt,
  rx: number,
  ry: number,
  seed: number,
  wobble = 0.16,
  corners = 14,
): string {
  const random = seeded(seed);
  const points = Array.from({ length: corners }, (_, i) => {
    const angle = (i / corners) * Math.PI * 2;
    const k = 1 + (random() - 0.5) * 2 * wobble;
    return {
      x: centre.x + Math.cos(angle) * rx * k,
      y: centre.y + Math.sin(angle) * ry * k,
    };
  });
  return smoothClosed(points);
}

/** A blade of tall grass: a pointed leaf from its foot (0,0) up to its tip, leaning by `lean`. */
export function bladePath(height: number, width: number, lean: number): string {
  const tip = { x: lean, y: -height };
  return `M${fix(-width)} 0 Q${fix(-width * 0.6 + lean * 0.3)} ${fix(-height * 0.55)} ${fix(tip.x)} ${fix(tip.y)} Q${fix(width * 0.7 + lean * 0.4)} ${fix(-height * 0.5)} ${fix(width)} 0Z`;
}

export interface Blade {
  d: string;
  at: Pt;
  shade: 0 | 1;
}

/** The blades of one patch of brush, fanned around a centre. */
export function brushBlades(centre: Pt, size: number, seed: number): Blade[] {
  const random = seeded(seed);
  const count = 9 + Math.floor(random() * 5);
  return Array.from({ length: count }, (_, i) => {
    const spread = ((i / (count - 1)) * 2 - 1) * size;
    return {
      d: bladePath(
        size * (0.9 + random() * 0.7),
        2.6 + random() * 1.6,
        spread * 0.35 + (random() - 0.5) * 6,
      ),
      at: {
        x: centre.x + spread + (random() - 0.5) * 6,
        y: centre.y + (random() - 0.5) * size * 0.7,
      },
      shade: random() > 0.45 ? 0 : 1,
    };
  });
}

/** A rock: a small polygon with a lit and a shaded half, for the edges of the clearings. */
export function rockPaths(
  centre: Pt,
  radius: number,
  seed: number,
): { lit: string; shade: string } {
  const random = seeded(seed);
  const sides = 7;
  const ring = Array.from({ length: sides }, (_, i) => {
    const angle = (i / sides) * Math.PI * 2 + random() * 0.4;
    const r = radius * (0.72 + random() * 0.4);
    return {
      x: centre.x + Math.cos(angle) * r,
      y: centre.y + Math.sin(angle) * r * 0.82,
    };
  });
  const poly = (pts: Pt[]) =>
    `M${pts.map((p) => `${fix(p.x)} ${fix(p.y)}`).join('L')}Z`;
  return {
    lit: poly([ring[4], ring[5], ring[6], ring[0], ring[1], centre]),
    shade: poly([ring[1], ring[2], ring[3], ring[4], centre]),
  };
}

/** A hexagon around a centre, as path data. */
export function hexPath(centre: Pt, radius: number, turn = 0): string {
  return `M${Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i + turn;
    return `${fix(centre.x + Math.cos(a) * radius)} ${fix(centre.y + Math.sin(a) * radius)}`;
  }).join('L')}Z`;
}
