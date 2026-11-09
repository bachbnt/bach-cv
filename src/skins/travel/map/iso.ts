/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { GEO_BOX } from '@/skins/travel/map/geo';
import { project, type Plane } from '@/skins/travel/map/projection';

/**
 * The 2.5D view: the flat map is turned clockwise (north points up and to the right, the sea to the lower right, as in the mock) and
 * squashed vertically. Sprites stand upright on the squashed ground. One matrix serves the SVG ground and the HTML sprites.
 */
export const ROTATION = (40 * Math.PI) / 180;
const TILT = 0.55;
const COS = Math.cos(ROTATION);
const SIN = Math.sin(ROTATION);

/** The matrix `a b c d` of the ground (an SVG `matrix(a b c d 0 0)`). */
export const GROUND_MATRIX = [COS, SIN * TILT, -SIN, COS * TILT] as const;

/** A point of the flat map as it appears on screen at zoom 1, before the offset that puts the map's corner at 0,0. */
const rawIso = (p: Plane): Plane => ({
  x: p.x * COS - p.y * SIN,
  y: (p.x * SIN + p.y * COS) * TILT,
});

const corners = [
  { x: 0, y: 0 },
  { x: GEO_BOX.width, y: 0 },
  { x: 0, y: GEO_BOX.height },
  { x: GEO_BOX.width, y: GEO_BOX.height },
].map(rawIso);

/** Room around the map for the slab edge and the sprites at its rim. */
const PAD = 160;
const MIN_X = Math.min(...corners.map((c) => c.x));
const MIN_Y = Math.min(...corners.map((c) => c.y));

/** The size in pixels of the whole map at zoom 1. */
export const WORLD = {
  width: Math.ceil(Math.max(...corners.map((c) => c.x)) - MIN_X + PAD * 2),
  height: Math.ceil(
    Math.max(...corners.map((c) => c.y)) - MIN_Y + PAD * 2 + 120,
  ),
} as const;

/** The offset that moves the map into the world box. */
export const WORLD_OFFSET = { x: PAD - MIN_X, y: PAD - MIN_Y } as const;

/** A point of the flat map as a position inside the world box (pixels at zoom 1). */
export function toWorld(p: Plane): Plane {
  const q = rawIso(p);
  return { x: q.x + WORLD_OFFSET.x, y: q.y + WORLD_OFFSET.y };
}

/** Latitude and longitude as a position inside the world box. */
export const worldOf = (lat: number, lng: number): Plane =>
  toWorld(project(lat, lng));

/** The four corners of the map's footprint in the world box (the top face of the slab). */
export const FOOTPRINT: readonly Plane[] = [
  { x: 0, y: 0 },
  { x: GEO_BOX.width, y: 0 },
  { x: GEO_BOX.width, y: GEO_BOX.height },
  { x: 0, y: GEO_BOX.height },
].map(toWorld);
