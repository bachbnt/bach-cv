/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import { cameraFromMatrix, cameraTransform } from '@/skins/travel/map/camera';
import {
  placeStops,
  positionAt,
  restingAt,
  rideOf,
  samePlace,
} from '@/skins/travel/map/route';

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

  it('is at its start with no progress and at its end with all of it, and in between on its way', () => {
    const ride = rideOf(stops[0], stops[4]);
    const xy = ({ x, y }: { x: number; y: number }) => ({ x, y });
    expect(xy(positionAt(ride, 0))).toEqual(xy(stops[0].at));
    expect(xy(positionAt(ride, 1))).toEqual(xy(stops[4].at));
    const mid = positionAt(ride, 0.5);
    const near = (a: { x: number; y: number }, b: { x: number; y: number }) =>
      Math.hypot(a.x - b.x, a.y - b.y);
    expect(near(mid, stops[0].at)).toBeGreaterThan(0);
    expect(near(mid, stops[4].at)).toBeGreaterThan(0);
  });

  it('starts the next ride from where a cut one was, on the road', () => {
    const ride = rideOf(stops[0], stops[4]);
    const here = restingAt(positionAt(ride, 0.5));
    expect(here.t).toBeGreaterThan(stops[0].t);
    expect(here.t).toBeLessThan(stops[4].t);
    const next = rideOf(here, stops[3]);
    expect(next.points.length).toBeGreaterThan(1);
  });

  it('knows a stop built again at the same place for the same stop, and another place for another', () => {
    expect(samePlace(stops[1], { ...stops[1] })).toBe(true);
    expect(samePlace(stops[1], stops[2])).toBe(false);
  });
});

describe('the camera given back by the transform of the world box', () => {
  it('is the camera the transform was made from', () => {
    const size = { w: 390, h: 800 };
    for (const camera of [
      { cx: 3200, cy: 2100, z: 0.9 },
      { cx: 1500, cy: 900, z: 0.35 },
    ]) {
      const [, x, y, z] =
        /translate\(([-\d.e]+)px, ([-\d.e]+)px\) scale\(([-\d.e]+)\)/.exec(
          cameraTransform(camera, size),
        ) ?? [];
      const back = cameraFromMatrix({ a: +z, e: +x, f: +y }, size);
      expect(back.z).toBeCloseTo(camera.z, 9);
      expect(back.cx).toBeCloseTo(camera.cx, 6);
      expect(back.cy).toBeCloseTo(camera.cy, 6);
    }
  });
});
