/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { PlacedStop } from '@/skins/travel/map/route';

/** A stop of the trip as the map draws it: the place (from `placeStops`) and the words and colour of its pin. */
export interface MapStop {
  id: string;
  /** the full accessible name of the pin (`FPT Software, Team Lead, Jan 2026 - now`) */
  name: string;
  /** the short text on the pin */
  title: string;
  period: string;
  /** which of the six stop colours (1 to 6) */
  color: number;
  type: 'school' | 'job';
  current: boolean;
  placed: PlacedStop;
}

/** What the camera looks at. `overview` is the whole trip. */
export type MapFocus =
  | { kind: 'overview' }
  | { kind: 'stop'; id: string }
  | { kind: 'place'; lat: number; lng: number; zoom: number };
