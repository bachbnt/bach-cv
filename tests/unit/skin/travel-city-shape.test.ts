/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import {
  crowdsSight,
  squashHeight,
  standsOnWay,
} from '@/skins/travel/map/city-shape';
import { CITY, RIVERS, ROADS_MAJOR, ROADS_MINOR } from '@/skins/travel/map/geo';
import { distanceToSegments, pathSegments } from '@/skins/travel/map/segments';
import { toWorld, worldOf } from '@/skins/travel/map/iso';
import { SIGHTS } from '@/skins/travel/map/sights';

describe('the buildings around the sights', () => {
  it('keeps the low houses as they are and holds the towers down, never reversing their order', () => {
    expect(squashHeight(20)).toBe(20);
    expect(squashHeight(28)).toBe(28);
    expect(squashHeight(95)).toBeLessThan(65);
    expect(squashHeight(95)).toBeGreaterThan(squashHeight(60));
    for (let h = 1; h < 120; h++)
      expect(squashHeight(h + 1)).toBeGreaterThan(squashHeight(h));
  });

  it('frees an oval of ground around a sight and leaves the rest alone', () => {
    const spot = { x: 1000, y: 1000, scale: 1 };
    expect(crowdsSight({ x: 1000, y: 990 }, [spot])).toBe(true);
    expect(crowdsSight({ x: 1090, y: 980 }, [spot])).toBe(true);
    expect(crowdsSight({ x: 1000, y: 1200 }, [spot])).toBe(false);
    expect(crowdsSight({ x: 1300, y: 1000 }, [spot])).toBe(false);
    // a bigger drawing frees more ground
    expect(crowdsSight({ x: 1140, y: 970 }, [{ ...spot, scale: 1.5 }])).toBe(
      true,
    );
    expect(crowdsSight({ x: 1140, y: 970 }, [spot])).toBe(false);
  });

  it('takes some, not most, of the city out for the sights on land', () => {
    const spots = SIGHTS.map((s) => {
      const w = worldOf(s.lat, s.lng);
      return { x: w.x, y: w.y, scale: s.scale };
    });
    const crowded = CITY.filter((row) =>
      crowdsSight(toWorld({ x: row[0], y: row[1] }), spots),
    ).length;
    expect(crowded).toBeGreaterThan(10);
    expect(crowded).toBeLessThan(CITY.length / 2);
  });
});

describe('the buildings and the ways', () => {
  it('reads the segments of a path with moves and relative lines', () => {
    expect(pathSegments('M10 20l5 0-5 10M100 100l1 1')).toEqual([
      { ax: 10, ay: 20, bx: 15, by: 20 },
      { ax: 15, ay: 20, bx: 10, by: 30 },
      { ax: 100, ay: 100, bx: 101, by: 101 },
    ]);
  });

  it('measures the distance to the nearest segment, also past its ends', () => {
    const line = pathSegments('M0 0l10 0');
    expect(distanceToSegments(5, 3, line)).toBe(3);
    expect(distanceToSegments(13, 4, line)).toBe(5);
    expect(distanceToSegments(0, 0, [])).toBe(Infinity);
  });

  it('puts a building on a way when its footprint reaches the way', () => {
    const way = [{ segments: pathSegments('M0 0l100 0'), halfWidth: 7.5 }];
    expect(standsOnWay([50, 0, 20, 20], way)).toBe(true);
    expect(standsOnWay([50, 15, 20, 20], way)).toBe(true);
    expect(standsOnWay([50, 40, 20, 20], way)).toBe(false);
  });

  it('frees the roads and the rivers of the map of houses, and keeps most of the city', () => {
    const ways = [
      { segments: pathSegments(ROADS_MAJOR), halfWidth: 7.5 },
      { segments: pathSegments(ROADS_MINOR), halfWidth: 3.5 },
      { segments: pathSegments(RIVERS), halfWidth: 4.5 },
    ];
    const on = CITY.filter((row) => standsOnWay(row, ways)).length;
    expect(on).toBeGreaterThan(10);
    expect(on).toBeLessThan(CITY.length * 0.6);
  });
});
