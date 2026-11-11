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
  'do-theatre',
  'co-tien',
  'truc-lam',
  'dong-bo',
  'hon-ro',
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
  | 'waterfall'
  | 'do-theatre'
  | 'co-tien'
  | 'zen-peak'
  | 'dong-bo'
  | 'hon-ro';

interface Sight {
  id: SightId;
  /** How well known the place is, or how much it stands out on the map (1 the most): the names of the first rank are always written, the others as the map is brought closer, and they choose their place first when tags lie on each other. */
  fame: 1 | 2 | 3;
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
    fame: 1,
    art: 'cham-towers',
    lat: 12.2653,
    lng: 109.1951,
    scale: 1.1,
    tag: 'left',
  },
  {
    id: 'hon-chong',
    fame: 1,
    art: 'twin-rocks',
    lat: 12.2721,
    lng: 109.2059,
    scale: 1,
    tag: 'right',
  },
  {
    id: 'long-son',
    fame: 1,
    art: 'buddha-pagoda',
    lat: 12.2513,
    lng: 109.1806,
    scale: 1.15,
    tag: 'left',
  },
  {
    id: 'cathedral',
    fame: 1,
    art: 'cathedral',
    lat: 12.2468,
    lng: 109.1881,
    scale: 1,
    tag: 'left',
  },
  {
    id: 'tram-huong',
    fame: 1,
    art: 'lotus-tower',
    lat: 12.2406,
    lng: 109.1969,
    scale: 0.9,
    tag: 'right',
  },
  {
    id: 'dam-market',
    fame: 1,
    art: 'dome-market',
    lat: 12.2553,
    lng: 109.1941,
    scale: 0.8,
    tag: 'left',
  },
  {
    id: 'yersin',
    fame: 2,
    art: 'villa',
    lat: 12.2509,
    lng: 109.1961,
    scale: 0.75,
    tag: 'right',
  },
  {
    id: 'oceanography',
    fame: 2,
    art: 'aquarium',
    lat: 12.208,
    lng: 109.2139,
    scale: 0.85,
    tag: 'left',
  },
  {
    id: 'bao-dai',
    fame: 2,
    art: 'villa-hill',
    lat: 12.2103,
    lng: 109.2154,
    scale: 0.85,
    tag: 'left',
  },
  {
    id: 'mud-bath',
    fame: 2,
    art: 'hot-spring',
    lat: 12.2704,
    lng: 109.177,
    scale: 0.85,
    tag: 'left',
  },
  {
    id: 'vinpearl',
    fame: 1,
    art: 'ferris-island',
    lat: 12.219,
    lng: 109.2395,
    scale: 1.25,
    tag: 'right',
  },
  {
    id: 'cable-car',
    fame: 2,
    art: 'cable-car',
    lat: 12.2028,
    lng: 109.2173,
    scale: 1,
    tag: 'left',
  },
  {
    id: 'hon-mieu',
    fame: 2,
    art: 'hon-mieu',
    lat: 12.1907,
    lng: 109.2249,
    scale: 0.9,
    tag: 'below',
  },
  {
    id: 'hon-tam',
    fame: 2,
    art: 'hon-tam',
    lat: 12.1765,
    lng: 109.2436,
    scale: 0.9,
    tag: 'below',
  },
  {
    id: 'hon-mot',
    fame: 2,
    art: 'hon-mot',
    lat: 12.1773,
    lng: 109.2743,
    scale: 0.9,
    tag: 'below',
  },
  {
    id: 'hon-mun',
    fame: 2,
    art: 'island-dive',
    lat: 12.1675,
    lng: 109.3025,
    scale: 1,
    tag: 'below',
  },
  {
    id: 'monkey-island',
    fame: 2,
    art: 'island-monkey',
    lat: 12.3598,
    lng: 109.2136,
    scale: 1,
    tag: 'right',
  },
  {
    id: 'ba-ho',
    fame: 2,
    art: 'waterfall',
    lat: 12.3822,
    lng: 109.1329,
    scale: 1.1,
    tag: 'right',
  },
  {
    id: 'do-theatre',
    fame: 2,
    art: 'do-theatre',
    lat: 12.30059,
    lng: 109.23734,
    scale: 1.1,
    tag: 'left',
  },
  {
    id: 'co-tien',
    fame: 2,
    art: 'co-tien',
    lat: 12.29409,
    lng: 109.20756,
    scale: 1.8,
    tag: 'below',
  },
  {
    id: 'truc-lam',
    fame: 2,
    art: 'zen-peak',
    lat: 12.22762,
    lng: 109.13005,
    scale: 1.6,
    tag: 'right',
  },
  {
    id: 'dong-bo',
    fame: 2,
    art: 'dong-bo',
    lat: 12.16366,
    lng: 109.14332,
    scale: 2.1,
    tag: 'right',
  },
  {
    id: 'hon-ro',
    fame: 2,
    art: 'hon-ro',
    lat: 12.1925,
    lng: 109.18448,
    scale: 1.3,
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
type EdgeId = 'cam-ranh' | 'bai-dai' | 'doc-let';

export const EDGE_SIGNS: readonly { id: EdgeId; lat: number; lng: number }[] = [
  { id: 'cam-ranh', lat: 11.9975, lng: 109.2189 },
  { id: 'bai-dai', lat: 12.0499, lng: 109.2226 },
  { id: 'doc-let', lat: 12.559, lng: 109.2336 },
];

/** The city centre the distances are measured from: the square at Tran Phu street (Quang truong 2/4). */
export const CITY_CENTRE = { lat: 12.238, lng: 109.1969 } as const;
