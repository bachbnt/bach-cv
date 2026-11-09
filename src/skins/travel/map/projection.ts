/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { GEO_BOX } from '@/skins/travel/map/geo';

/** A point of the flat map ("plane units", see `geo.ts`): x to the east, y to the south. */
export interface Plane {
  x: number;
  y: number;
}

/** Shrinks a degree of longitude to its real length at the latitude of the map (equirectangular projection). */
const COS_LAT = Math.cos(
  (((GEO_BOX.north + GEO_BOX.south) / 2) * Math.PI) / 180,
);

/** Real latitude and longitude to the flat map: the same projection `scripts/travel/build-geo.mjs` applied to the OpenStreetMap data. */
export function project(lat: number, lng: number): Plane {
  return {
    x: (lng - GEO_BOX.west) * COS_LAT * GEO_BOX.unitsPerDegree,
    y: (GEO_BOX.north - lat) * GEO_BOX.unitsPerDegree,
  };
}

/** The way back: a point of the flat map to latitude and longitude. */
export function unproject(p: Plane): { lat: number; lng: number } {
  return {
    lat: GEO_BOX.north - p.y / GEO_BOX.unitsPerDegree,
    lng: GEO_BOX.west + p.x / (COS_LAT * GEO_BOX.unitsPerDegree),
  };
}

/** Real ground distance between two points of the map, in kilometres (111.32 km a degree of latitude). */
export function groundKm(a: Plane, b: Plane): number {
  return (Math.hypot(a.x - b.x, a.y - b.y) / GEO_BOX.unitsPerDegree) * 111.32;
}

/** Great-circle distance between two coordinates, in kilometres (for the signs at the edge of the map that point to places outside it). */
export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLng = (b.lng - a.lng) * rad;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}
