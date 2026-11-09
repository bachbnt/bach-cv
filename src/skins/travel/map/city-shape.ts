/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { distanceToSegments, type Segment } from '@/skins/travel/map/segments';

/** Buildings up to this height keep it; above it they grow at `TALL_RATE`, so a tower no longer drowns the sights standing among them. */
const KEEP = 28;
const TALL_RATE = 0.45;

export const squashHeight = (h: number): number =>
  h <= KEEP ? h : KEEP + (h - KEEP) * TALL_RATE;

interface Spot {
  x: number;
  y: number;
  /** The size of the sight's drawing (`sights.ts`). */
  scale: number;
}

/** Half-width and half-depth of the ground kept free around a sight (world pixels at scale 1), and how far up from its base it reaches. */
const REACH_X = 100;
const REACH_Y = 55;
const LIFT = 20;

/** True when a point of the ground lies in the oval kept free around a sight, where the drawing stands and a building would crowd it. */
export const crowdsSight = (
  p: { x: number; y: number },
  spots: readonly Spot[],
): boolean =>
  spots.some((s) => {
    const dx = (p.x - s.x) / (REACH_X * s.scale);
    const dy = (p.y - (s.y - LIFT * s.scale)) / (REACH_Y * s.scale);
    return dx * dx + dy * dy < 1;
  });

/** What a building must keep clear of: a way (road, river) with the half-width it is drawn at, in ground pixels. */
export interface Way {
  segments: readonly Segment[];
  halfWidth: number;
}

/** True when the footprint of a building (centre, width, depth) reaches onto one of the ways. */
export function standsOnWay(
  row: readonly number[],
  ways: readonly Way[],
): boolean {
  const [x, y, w, d] = row;
  // the footprint is turned by an angle: its half-diagonal, a little eased, is the reach that is always safe
  const reach = Math.hypot(w, d) * 0.375;
  return ways.some(
    (way) => distanceToSegments(x, y, way.segments) < way.halfWidth + reach,
  );
}
