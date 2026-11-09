/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

export type Pt = readonly [number, number];

/** One decimal is enough for a 160 px drawing and keeps the markup short. */
export const fmt = (v: number) => Math.round(v * 10) / 10;

export const pt = (p: Pt) => `${fmt(p[0])} ${fmt(p[1])}`;

export const lerp = (p: Pt, q: Pt, s: number): Pt => [
  p[0] + (q[0] - p[0]) * s,
  p[1] + (q[1] - p[1]) * s,
];

export const rad = (deg: number) => (deg * Math.PI) / 180;
