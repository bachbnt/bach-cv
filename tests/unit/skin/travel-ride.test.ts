/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import { placeStops, rideOf } from '@/skins/travel/map/route';

const stops = placeStops([
  { id: 'school', side: false },
  { id: 'first', side: false },
  { id: 'side', side: true },
  { id: 'second', side: false },
  { id: 'now', side: false },
]);

describe('the ride of the traveller, which the camera and the tour follow', () => {
  it('goes from one stop to the other, with the offsets of its points rising from 0 to 1', () => {
    const ride = rideOf(stops[0], stops[4]);
    const xy = ({ x, y }: { x: number; y: number }) => ({ x, y });
    expect(xy(ride.points[0].at)).toEqual(xy(stops[0].at));
    expect(xy(ride.points[ride.points.length - 1].at)).toEqual(xy(stops[4].at));
    const offsets = ride.points.map((p) => p.offset);
    expect(offsets[0]).toBe(0);
    expect(offsets[offsets.length - 1]).toBeCloseTo(1, 6);
    offsets.forEach(
      (o, i) => i && expect(o).toBeGreaterThanOrEqual(offsets[i - 1]),
    );
  });

  it('lasts longer for a long way than for a short one, between a least and a most time', () => {
    const long = rideOf(stops[0], stops[4]).duration;
    const short = rideOf(stops[3], stops[4]).duration;
    expect(long).toBeGreaterThan(short);
    for (const d of [long, short]) {
      expect(d).toBeGreaterThanOrEqual(900);
      expect(d).toBeLessThanOrEqual(5200);
    }
  });
});
