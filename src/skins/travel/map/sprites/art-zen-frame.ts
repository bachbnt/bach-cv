/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { BoxShape } from '@/skins/travel/map/sprites/art-parts';

/** The stone terrace on the summit that carries the temple: its front corner stands on the peak. */
export const TERRACE: BoxShape = { cx: 84, y: 70, wl: 30, wr: 28, h: 4 };

/** Screen point on the top of the terrace: `u` runs up and right along the right face, `s` up and left along the left face. */
export function onTerrace(u: number, s: number) {
  return [
    TERRACE.cx + u - s,
    TERRACE.y - TERRACE.h - 0.5 * u - 0.5 * s,
  ] as const;
}

interface Row {
  y: number;
  left: number;
  right: number;
}

/** The sides of the peak: the bounds of the green mass at a few heights. */
const EDGES: readonly Row[] = [
  { y: 52, left: 60, right: 110 },
  { y: 60, left: 52, right: 114 },
  { y: 74, left: 46, right: 120 },
  { y: 90, left: 42, right: 124 },
  { y: 104, left: 37, right: 128 },
  { y: 120, left: 30, right: 138 },
  { y: 136, left: 18, right: 146 },
  { y: 148, left: 8, right: 152 },
];

/** The ridge between the lit and the shaded face: x at a few heights. */
export const RIDGE: readonly (readonly [number, number])[] = [
  [46, 92],
  [70, 88],
  [92, 98],
  [114, 90],
  [150, 96],
];

function along(
  list: readonly (readonly [number, number])[],
  y: number,
): number {
  let found = list[list.length - 1]?.[1] ?? 0;
  for (let i = list.length - 2; i >= 0; i--) {
    const a = list[i];
    const b = list[i + 1];
    if (a && b && y <= b[0]) {
      const f = Math.min(Math.max((y - a[0]) / (b[0] - a[0]), 0), 1);
      found = a[1] + (b[1] - a[1]) * f;
    }
  }
  return found;
}

/** The left and the right bound of the green mass at height `y`. */
export const sides = (y: number) => ({
  left: along(
    EDGES.map((r) => [r.y, r.left] as const),
    y,
  ),
  right: along(
    EDGES.map((r) => [r.y, r.right] as const),
    y,
  ),
});

/** x of the ridge at height `y`. */
export const ridgeAt = (y: number) => along(RIDGE, y);
