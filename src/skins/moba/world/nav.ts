/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import {
  BARON_PIT,
  BLUE_BASE,
  DRAGON_PIT,
  LANE_IDS,
  LANES,
  RED_BASE,
  dist,
  lerp,
  roundedLine,
  type Pt,
} from '@/skins/moba/world/geometry';
import { STATIONS } from '@/skins/moba/world/stations';

/** Two points closer than this are one place when the trails are laid out. */
const SNAP = 6;

/**
 * The trails that lead from the lanes and the river to a station that is not on one (the shop, the vault, the shrine, the lore stone).
 * They are drawn on the ground and the champion can walk on them; the rest of the walkable ground is in `ground.ts`.
 */
export const TRAILS: Pt[][] = buildTrails();

function buildTrails(): Pt[][] {
  const places: Pt[] = [BLUE_BASE, RED_BASE];
  for (const lane of LANE_IDS) places.push(...LANES[lane].samples);
  // the river path runs from the baron pit to the dragon pit through the centre, where it meets the mid lane
  const centre = { x: 600, y: 600 };
  places.push(
    ...roundedLine([BARON_PIT, centre], 0).samples,
    ...roundedLine([centre, DRAGON_PIT], 0).samples,
  );
  const trails: Pt[][] = [];
  for (const station of STATIONS) {
    if (places.some((p) => dist(p, station.at) <= SNAP)) continue;
    let best = places[0];
    for (const p of places)
      if (dist(p, station.at) < dist(best, station.at)) best = p;
    trails.push([best, station.at]);
    places.push(station.at);
  }
  return trails;
}

export function pathLength(path: Pt[]): number {
  let total = 0;
  for (let i = 1; i < path.length; i += 1) total += dist(path[i - 1], path[i]);
  return total;
}

/** Where a walker is after `walked` units of the path (the end when it is past it). */
export function pointAtDistance(path: Pt[], walked: number): Pt {
  let left = Math.max(0, walked);
  for (let i = 1; i < path.length; i += 1) {
    const step = dist(path[i - 1], path[i]);
    if (left <= step)
      return lerp(path[i - 1], path[i], step === 0 ? 0 : left / step);
    left -= step;
  }
  return path[path.length - 1];
}
