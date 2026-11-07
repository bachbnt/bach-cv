/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { PageKey } from '@/lib/content/schema';
import {
  BARON_PIT,
  DRAGON_PIT,
  FOUNTAIN_PAD,
  type Pt,
} from '@/skins/moba/world/geometry';

/** The places of the map that open a page when the champion arrives. */
export type StationId =
  | 'fountain'
  | 'shop'
  | 'vault'
  | 'mid'
  | 'dragon'
  | 'baron'
  | 'shrine'
  | 'lore';

export interface Station {
  id: StationId;
  /** the page it opens */
  page: PageKey;
  at: Pt;
  /** how close the champion has to be to count as there, when it is walked by hand */
  radius: number;
}

export const STATIONS: Station[] = [
  { id: 'fountain', page: 'home', at: FOUNTAIN_PAD, radius: 60 },
  { id: 'shop', page: 'services', at: { x: 334, y: 1010 }, radius: 44 },
  { id: 'vault', page: 'payment', at: { x: 226, y: 862 }, radius: 44 },
  { id: 'mid', page: 'resume', at: { x: 600, y: 600 }, radius: 50 },
  { id: 'dragon', page: 'projects', at: DRAGON_PIT, radius: 56 },
  { id: 'baron', page: 'projects', at: BARON_PIT, radius: 56 },
  { id: 'shrine', page: 'certificates', at: { x: 272, y: 640 }, radius: 44 },
  { id: 'lore', page: 'about', at: { x: 640, y: 944 }, radius: 44 },
];

const BY_PAGE = new Map<PageKey, Station>();
for (const station of STATIONS) {
  if (!BY_PAGE.has(station.page)) BY_PAGE.set(station.page, station);
}

/** The station a page belongs to (the first one when two lead to the same page, so the dragon pit and not the baron pit). */
export function stationOfPage(page: PageKey): Station {
  const station = BY_PAGE.get(page);
  if (!station) throw new Error(`no station for ${page}`);
  return station;
}

export const stationById = (id: StationId): Station => {
  const station = STATIONS.find((s) => s.id === id);
  if (!station) throw new Error(`no station ${id}`);
  return station;
};
