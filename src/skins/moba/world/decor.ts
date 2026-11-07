/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { mirror, seeded, type Pt } from '@/skins/moba/world/geometry';

/** The four clearings of the jungle: the blue side has the west and south ones, the red side the north and east ones. */
export interface Clearing {
  id: 'west' | 'south' | 'north' | 'east';
  centre: Pt;
  rx: number;
  ry: number;
  seed: number;
}

export const CLEARINGS: Clearing[] = [
  { id: 'west', centre: { x: 310, y: 640 }, rx: 132, ry: 250, seed: 11 },
  { id: 'south', centre: { x: 560, y: 890 }, rx: 250, ry: 132, seed: 12 },
  { id: 'north', centre: { x: 890, y: 560 }, rx: 132, ry: 250, seed: 13 },
  { id: 'east', centre: { x: 640, y: 310 }, rx: 250, ry: 132, seed: 14 },
];

const both = (points: Pt[]): Pt[] => [...points, ...points.map(mirror)];

/** The patches of tall grass beside the lanes and the river (the blue ones; the red ones are their mirror). */
export const BRUSH: Pt[] = both([
  { x: 198, y: 520 },
  { x: 194, y: 760 },
  { x: 384, y: 776 },
  { x: 440, y: 520 },
  { x: 520, y: 884 },
  { x: 700, y: 1000 },
  { x: 430, y: 1020 },
  { x: 500, y: 800 },
]);

export type CampKind = 'paw' | 'crystal' | 'horn';

export interface Camp {
  at: Pt;
  kind: CampKind;
}

/** The monster camps of the blue half of the jungle (the red half is their mirror): decoration, a ring with a small mark. */
const BLUE_CAMPS: Camp[] = [
  { at: { x: 300, y: 500 }, kind: 'paw' },
  { at: { x: 250, y: 744 }, kind: 'horn' },
  { at: { x: 400, y: 660 }, kind: 'crystal' },
  { at: { x: 500, y: 912 }, kind: 'paw' },
  { at: { x: 704, y: 852 }, kind: 'crystal' },
  { at: { x: 420, y: 846 }, kind: 'horn' },
  // the two camps of the river
  { at: { x: 470, y: 470 }, kind: 'crystal' },
];

export const CAMPS: Camp[] = BLUE_CAMPS.flatMap((camp) => [
  camp,
  { ...camp, at: mirror(camp.at) },
]);

/** Rocks and big trees around the edge of each clearing: the same every time. */
export function edgeProps(
  clearing: Clearing,
  count: number,
  seedOffset: number,
): Pt[] {
  const random = seeded(clearing.seed * 31 + seedOffset);
  return Array.from({ length: count }, (_, i) => {
    const angle = ((i + random() * 0.8) / count) * Math.PI * 2;
    const reach = 1.02 + random() * 0.1;
    return {
      x: clearing.centre.x + Math.cos(angle) * clearing.rx * reach,
      y: clearing.centre.y + Math.sin(angle) * clearing.ry * reach,
    };
  });
}
