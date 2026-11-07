/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { BOATS } from '@/skins/travel/map/scenery';
import {
  BEACHES,
  CITY,
  COAST_ROAD,
  GEO_BOX,
  LAND,
  PEAKS,
} from '@/skins/travel/map/geo';
import {
  project,
  unproject,
  haversineKm,
  groundKm,
} from '@/skins/travel/map/projection';
import { ROTATION, toWorld, worldOf } from '@/skins/travel/map/iso';
import {
  placeStops,
  pointAt,
  roadBetween,
  ROUTE_LENGTH,
} from '@/skins/travel/map/route';
import {
  CITY_CENTRE,
  EDGE_SIGNS,
  SIGHTS,
  type SightId,
} from '@/skins/travel/map/sights';

const sight = (id: SightId) => {
  const s = SIGHTS.find((x) => x.id === id);
  if (!s) throw new Error(id);
  return project(s.lat, s.lng);
};
const centre = project(CITY_CENTRE.lat, CITY_CENTRE.lng);

/** The rings of an SVG path made of `M x y l dx dy ...z` (what `build-geo.mjs` writes). */
function rings(d: string): [number, number][][] {
  return d
    .split('M')
    .filter(Boolean)
    .map((part) => {
      const [start, rest = ''] = part.replace('z', '').split('l');
      const [x, y] = start.split(/[ ,]/).map(Number);
      const points: [number, number][] = [[x, y]];
      const nums = rest
        .replace(/-/g, ' -')
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map(Number);
      for (let i = 0; i + 1 < nums.length; i += 2) {
        const last = points[points.length - 1];
        points.push([last[0] + nums[i], last[1] + nums[i + 1]]);
      }
      return points;
    });
}
const inside = (ring: [number, number][], x: number, y: number) => {
  let c = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi)
      c = !c;
  }
  return c;
};
const landRings = rings(LAND);
const onLand = (x: number, y: number) =>
  landRings.reduce((c, r) => (inside(r, x, y) ? !c : c), false);

describe('the projection', () => {
  it('puts north up (smaller y) and east to the right (bigger x)', () => {
    const a = project(12.25, 109.2);
    expect(project(12.3, 109.2).y).toBeLessThan(a.y);
    expect(project(12.25, 109.25).x).toBeGreaterThan(a.x);
  });

  it('is undone by unproject', () => {
    const back = unproject(project(12.2653, 109.1951));
    expect(back.lat).toBeCloseTo(12.2653, 6);
    expect(back.lng).toBeCloseTo(109.1951, 6);
  });

  it('keeps real distances (a degree of latitude is 111 km, a degree of longitude shrinks with cos latitude)', () => {
    const a = project(12.2, 109.2);
    expect(groundKm(a, project(12.3, 109.2))).toBeCloseTo(11.1, 0);
    expect(groundKm(a, project(12.2, 109.3))).toBeCloseTo(
      haversineKm({ lat: 12.2, lng: 109.2 }, { lat: 12.2, lng: 109.3 }),
      0,
    );
  });

  it('turns the map so that north points up and to the right, and the sea (east) down and to the right', () => {
    expect(ROTATION).toBeGreaterThan(0);
    const origin = toWorld({ x: 1000, y: 1000 });
    const north = toWorld({ x: 1000, y: 0 });
    const east = toWorld({ x: 2000, y: 1000 });
    expect(north.y).toBeLessThan(origin.y);
    expect(north.x).toBeGreaterThan(origin.x);
    expect(east.y).toBeGreaterThan(origin.y);
    expect(east.x).toBeGreaterThan(origin.x);
  });
});

describe('the sights keep their real places', () => {
  it('has the famous places of Nha Trang (at least 12, with a sign for each place off the map)', () => {
    expect(SIGHTS.length).toBeGreaterThanOrEqual(12);
    expect(EDGE_SIGNS.map((s) => s.id).sort()).toEqual([
      'bai-dai',
      'cam-ranh',
      'doc-let',
    ]);
  });

  it('Hon Chong is north of the city centre, at the north end of the beach, Po Nagar beside the Cai River bridge', () => {
    expect(sight('hon-chong').y).toBeLessThan(centre.y);
    expect(sight('po-nagar').y).toBeLessThan(centre.y);
    expect(sight('hon-chong').y).toBeLessThan(sight('po-nagar').y);
  });

  it('Long Son pagoda is west of the centre, the cathedral too, but east of Long Son', () => {
    expect(sight('long-son').x).toBeLessThan(centre.x);
    expect(sight('cathedral').x).toBeLessThan(centre.x);
    expect(sight('long-son').x).toBeLessThan(sight('cathedral').x);
  });

  it('Vinpearl on Hon Tre is north-east of the beach, across the sea, and the cable car runs to it from Cau Da in the south', () => {
    const beachMid = project(12.235, 109.1972);
    expect(sight('vinpearl').x).toBeGreaterThan(beachMid.x);
    expect(sight('cable-car').y).toBeGreaterThan(centre.y);
    expect(sight('cable-car').x).toBeLessThan(sight('vinpearl').x);
  });

  it('the islands are in the bay, south-east of the city and east of the beach', () => {
    for (const id of ['hon-mieu', 'hon-tam', 'hon-mot', 'hon-mun'] as const) {
      expect(sight(id).x).toBeGreaterThan(centre.x);
      expect(sight(id).y).toBeGreaterThan(centre.y);
    }
    expect(sight('hon-mun').x).toBeGreaterThan(sight('hon-mot').x);
    expect(sight('hon-mot').x).toBeGreaterThan(sight('hon-tam').x);
  });

  it('Monkey Island and Ba Ho are in the north, Cam Ranh and Bai Dai (off the map) in the south, Doc Let in the north', () => {
    expect(sight('monkey-island').y).toBeLessThan(sight('hon-chong').y);
    expect(sight('ba-ho').y).toBeLessThan(sight('hon-chong').y);
    const edge = (id: string) => EDGE_SIGNS.find((s) => s.id === id)!;
    expect(edge('cam-ranh').lat).toBeLessThan(CITY_CENTRE.lat);
    expect(edge('bai-dai').lat).toBeLessThan(CITY_CENTRE.lat);
    expect(edge('doc-let').lat).toBeGreaterThan(CITY_CENTRE.lat);
    expect(haversineKm(CITY_CENTRE, edge('cam-ranh'))).toBeGreaterThan(20);
  });

  it('the places on land are on land, the islands on islands, and the boats at sea', () => {
    for (const id of [
      'po-nagar',
      'hon-chong',
      'long-son',
      'cathedral',
      'tram-huong',
      'dam-market',
      'yersin',
      'oceanography',
      'mud-bath',
    ] as const) {
      const p = sight(id);
      expect(onLand(p.x, p.y), id).toBe(true);
    }
    for (const id of [
      'hon-mun',
      'hon-mot',
      'hon-tam',
      'hon-mieu',
      'vinpearl',
      'monkey-island',
    ] as const) {
      const p = sight(id);
      expect(onLand(p.x, p.y), id).toBe(true);
    }
    for (const boat of BOATS) {
      const p = project(boat.lat, boat.lng);
      expect(onLand(p.x, p.y), `${boat.lat},${boat.lng}`).toBe(false);
    }
  });

  it('the sea is east of the beach: the city beach has water to its east and land to its west', () => {
    const beach = project(12.235, 109.1975);
    expect(onLand(beach.x - 120, beach.y)).toBe(true);
    expect(onLand(beach.x + 220, beach.y)).toBe(false);
  });
});

describe('the data of the map', () => {
  it('is small enough to stay in the lazy chunk (under 40 KB of source)', () => {
    expect(readFileSync('src/skins/travel/map/geo.ts').length).toBeLessThan(
      40 * 1024,
    );
  });

  it('has the land, a beach, the city, peaks and the coast road', () => {
    expect(landRings.length).toBeGreaterThan(8);
    expect(BEACHES.length).toBeGreaterThan(100);
    expect(CITY.length).toBeGreaterThan(100);
    expect(PEAKS.length).toBeGreaterThan(5);
    expect(COAST_ROAD.length).toBeGreaterThan(10);
  });

  it('keeps every point inside the map box (with a margin)', () => {
    for (const ring of landRings)
      for (const [x, y] of ring) {
        expect(x).toBeGreaterThanOrEqual(-5);
        expect(y).toBeGreaterThanOrEqual(-5);
        expect(x).toBeLessThanOrEqual(GEO_BOX.width + 5);
        expect(y).toBeLessThanOrEqual(GEO_BOX.height + 5);
      }
  });
});

describe('the coast road and the stations', () => {
  it('runs from south to north: the end is north of the start, and along the beach', () => {
    expect(pointAt(1).y).toBeLessThan(pointAt(0).y);
    expect(ROUTE_LENGTH).toBeGreaterThan(1000);
    const km = groundKm(pointAt(0), pointAt(1));
    expect(km).toBeGreaterThan(8);
    expect(km).toBeLessThan(14);
  });

  it('roadBetween follows the road in both directions', () => {
    const up = roadBetween(0.2, 0.6);
    const down = roadBetween(0.6, 0.2);
    expect(down[0]).toEqual(up[up.length - 1]);
    expect(up.length).toBeGreaterThan(2);
  });

  it('places the stops of the main road from south to north, in the order of the career', () => {
    const placed = placeStops([
      { id: 'school', side: false },
      { id: 'a', side: false },
      { id: 'b', side: false },
      { id: 'side', side: true },
      { id: 'now', side: false },
    ]);
    const main = placed.filter((s) => !s.side);
    expect(main.map((s) => s.id)).toEqual(['school', 'a', 'b', 'now']);
    for (let i = 1; i < main.length; i += 1) {
      expect(main[i].t).toBeGreaterThan(main[i - 1].t);
      expect(main[i].at.y).toBeLessThanOrEqual(main[i - 1].at.y);
    }
    // the first stop is in the south and the current one in the north, both on land
    expect(main[0].at.y).toBeGreaterThan(centre.y - 400);
    expect(main[3].at.y).toBeLessThan(centre.y);
    for (const stop of placed)
      expect(onLand(stop.at.x, stop.at.y), stop.id).toBe(true);
  });

  it('puts a side trip on a spur toward the hills, off the road, between its main stops', () => {
    const [, , , side] = placeStops([
      { id: 'a', side: false },
      { id: 'b', side: false },
      { id: 'c', side: false },
      { id: 'side', side: true },
      { id: 'd', side: false },
    ]);
    expect(side.at.x).toBeLessThan(side.from.x);
    expect(
      Math.hypot(side.at.x - side.from.x, side.at.y - side.from.y),
    ).toBeGreaterThan(100);
  });

  it('worldOf gives the same place as toWorld(project())', () => {
    expect(worldOf(12.25, 109.2)).toEqual(toWorld(project(12.25, 109.2)));
  });
});
