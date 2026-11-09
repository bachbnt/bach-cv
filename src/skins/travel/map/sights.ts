/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/**
 * The famous places of Nha Trang drawn on the map. They are scenery (decoration, `aria-hidden`): the owner's career is in the stops,
 * never here. The coordinates were read from OpenStreetMap (© OpenStreetMap contributors, ODbL); names and descriptions are in
 * `content/copy/travel-map.ts`.
 */

export const SIGHT_IDS = [
  'po-nagar',
  'hon-chong',
  'long-son',
  'cathedral',
  'tram-huong',
  'dam-market',
  'yersin',
  'oceanography',
  'bao-dai',
  'mud-bath',
  'vinpearl',
  'cable-car',
  'hon-mieu',
  'hon-tam',
  'hon-mot',
  'hon-mun',
  'monkey-island',
  'ba-ho',
] as const;
export type SightId = (typeof SIGHT_IDS)[number];

/** Which drawing a sight gets (`map/sprites`). */
export type SightArt =
  | 'cham-towers'
  | 'twin-rocks'
  | 'buddha-pagoda'
  | 'cathedral'
  | 'lotus-tower'
  | 'dome-market'
  | 'villa'
  | 'aquarium'
  | 'villa-hill'
  | 'hot-spring'
  | 'ferris-island'
  | 'cable-car'
  | 'hon-mieu'
  | 'hon-tam'
  | 'hon-mot'
  | 'island-dive'
  | 'island-monkey'
  | 'waterfall';

export interface Sight {
  id: SightId;
  art: SightArt;
  lat: number;
  lng: number;
  /** Size of the drawing (1 = about 90 px at zoom 1). */
  scale: number;
  /** Where the name tag sits against the drawing. */
  tag: 'left' | 'right' | 'below';
}

export const SIGHTS: readonly Sight[] = [
  {
    id: 'po-nagar',
    art: 'cham-towers',
    lat: 12.2653,
    lng: 109.1951,
    scale: 1.1,
    tag: 'left',
  },
  {
    id: 'hon-chong',
    art: 'twin-rocks',
    lat: 12.2721,
    lng: 109.2059,
    scale: 1,
    tag: 'right',
  },
  {
    id: 'long-son',
    art: 'buddha-pagoda',
    lat: 12.2513,
    lng: 109.1806,
    scale: 1.15,
    tag: 'left',
  },
  {
    id: 'cathedral',
    art: 'cathedral',
    lat: 12.2468,
    lng: 109.1881,
    scale: 1,
    tag: 'left',
  },
  {
    id: 'tram-huong',
    art: 'lotus-tower',
    lat: 12.2406,
    lng: 109.1969,
    scale: 0.9,
    tag: 'right',
  },
  {
    id: 'dam-market',
    art: 'dome-market',
    lat: 12.2553,
    lng: 109.1941,
    scale: 0.8,
    tag: 'left',
  },
  {
    id: 'yersin',
    art: 'villa',
    lat: 12.2509,
    lng: 109.1961,
    scale: 0.75,
    tag: 'right',
  },
  {
    id: 'oceanography',
    art: 'aquarium',
    lat: 12.208,
    lng: 109.2139,
    scale: 0.85,
    tag: 'left',
  },
  {
    id: 'bao-dai',
    art: 'villa-hill',
    lat: 12.2103,
    lng: 109.2154,
    scale: 0.85,
    tag: 'left',
  },
  {
    id: 'mud-bath',
    art: 'hot-spring',
    lat: 12.2704,
    lng: 109.177,
    scale: 0.85,
    tag: 'left',
  },
  {
    id: 'vinpearl',
    art: 'ferris-island',
    lat: 12.219,
    lng: 109.2395,
    scale: 1.25,
    tag: 'right',
  },
  {
    id: 'cable-car',
    art: 'cable-car',
    lat: 12.2028,
    lng: 109.2173,
    scale: 1,
    tag: 'left',
  },
  {
    id: 'hon-mieu',
    art: 'hon-mieu',
    lat: 12.1907,
    lng: 109.2249,
    scale: 0.9,
    tag: 'below',
  },
  {
    id: 'hon-tam',
    art: 'hon-tam',
    lat: 12.1765,
    lng: 109.2436,
    scale: 0.9,
    tag: 'below',
  },
  {
    id: 'hon-mot',
    art: 'hon-mot',
    lat: 12.1773,
    lng: 109.2743,
    scale: 0.9,
    tag: 'below',
  },
  {
    id: 'hon-mun',
    art: 'island-dive',
    lat: 12.1675,
    lng: 109.3025,
    scale: 1,
    tag: 'below',
  },
  {
    id: 'monkey-island',
    art: 'island-monkey',
    lat: 12.3598,
    lng: 109.2136,
    scale: 1,
    tag: 'right',
  },
  {
    id: 'ba-ho',
    art: 'waterfall',
    lat: 12.3822,
    lng: 109.1329,
    scale: 1.1,
    tag: 'right',
  },
];

/**
 * The second station of the cable car on Hon Tre (the first is `cable-car`, on the mainland at Cau Da). The line between them is drawn
 * over the sea.
 */
export const CABLE_CAR = {
  from: { lat: 12.2028, lng: 109.2173 },
  to: { lat: 12.2147, lng: 109.2393 },
} as const;

/** Places that are off the map: a sign at its edge points to them (name and distance from the copy and the coordinates). */
export const EDGE_IDS = ['cam-ranh', 'bai-dai', 'doc-let'] as const;
export type EdgeId = (typeof EDGE_IDS)[number];

export const EDGE_SIGNS: readonly { id: EdgeId; lat: number; lng: number }[] = [
  { id: 'cam-ranh', lat: 11.9975, lng: 109.2189 },
  { id: 'bai-dai', lat: 12.0499, lng: 109.2226 },
  { id: 'doc-let', lat: 12.559, lng: 109.2336 },
];

/** The city centre the distances are measured from: the square at Tran Phu street (Quang truong 2/4). */
export const CITY_CENTRE = { lat: 12.238, lng: 109.1969 } as const;
