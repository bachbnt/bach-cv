/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import {
  SLACK,
  cameraOffset,
  scaleFor,
  worldAt,
} from '@/skins/moba/world/camera';
import { WORLD, dist } from '@/skins/moba/world/geometry';
import { routeTo } from '@/skins/moba/world/ground';
import { stationOfPage } from '@/skins/moba/world/stations';
import { SPEED, Walker } from '@/skins/moba/world/walker';

const run = (walker: Walker, seconds: number) => {
  let last = walker.tick(0);
  for (let t = 0; t < seconds; t += 1 / 60) last = walker.tick(1 / 60);
  return last;
};

describe('the walker', () => {
  it('walks a path at about its speed, then arrives exactly on the last point and says so once', () => {
    const start = stationOfPage('home').at;
    const goal = stationOfPage('resume').at;
    const path = routeTo(start, goal);
    const walker = new Walker(start);
    walker.walk(path);
    let arrivals = 0;
    let frames = 0;
    for (; frames < 60 * 30; frames += 1) {
      const step = walker.tick(1 / 60);
      if (step.arrived) arrivals += 1;
      if (!walker.walking) break;
    }
    expect(arrivals).toBe(1);
    expect(dist(walker.pos, goal)).toBeLessThan(0.5);
    // the walk takes a few seconds: not instant, not forever
    expect(frames / 60).toBeGreaterThan(1);
    expect(frames / 60).toBeLessThan(8);
    expect(walker.tick(1 / 60).moving).toBe(false);
  });

  it('never goes faster than the speed', () => {
    const start = stationOfPage('home').at;
    const walker = new Walker(start);
    walker.walk(routeTo(start, stationOfPage('projects').at));
    const before = { ...walker.pos };
    walker.tick(0.5);
    expect(dist(before, walker.pos)).toBeLessThanOrEqual(SPEED * 0.5 + 1);
  });

  it('is put somewhere at once and stops walking', () => {
    const walker = new Walker({ x: 1, y: 1 });
    walker.walk(
      routeTo(stationOfPage('home').at, stationOfPage('services').at),
    );
    walker.place({ x: 600, y: 600 });
    expect(walker.walking).toBe(false);
    expect(walker.pos).toEqual({ x: 600, y: 600 });
  });

  it('steers by hand along a lane, and a new walk cancels the keys', () => {
    const walker = new Walker({ x: 118, y: 700 });
    walker.hold('up', true);
    const step = run(walker, 0.5);
    expect(step.moving).toBe(true);
    expect(walker.pos.y).toBeLessThan(700);
    expect(Math.abs(walker.pos.x - 118)).toBeLessThan(1);
    walker.walk(routeTo(walker.pos, stationOfPage('certificates').at));
    expect(walker.steering).toBe(false);
    walker.hold('left', true);
    expect(walker.walking).toBe(false);
  });

  it('stays inside the map', () => {
    const walker = new Walker({ x: 118, y: 130 });
    walker.hold('up', true);
    run(walker, 3);
    expect(walker.pos.y).toBeGreaterThanOrEqual(0);
    expect(walker.pos.x).toBeLessThanOrEqual(WORLD);
  });
});

describe('the camera', () => {
  const view = { w: 1000, h: 600 };

  it('puts the champion on the focus point, away from the edges', () => {
    const scale = 1.5;
    const camera = cameraOffset({ x: 600, y: 600 }, scale, view, {
      x: 400,
      y: 300,
    });
    expect(600 * scale + camera.x).toBeCloseTo(400);
    expect(600 * scale + camera.y).toBeCloseTo(300);
  });

  it('shows only a little beyond the edge of the map', () => {
    const scale = 1.5;
    const corner = cameraOffset({ x: 0, y: 1200 }, scale, view, {
      x: 400,
      y: 300,
    });
    expect(corner.x).toBe(SLACK);
    expect(corner.y).toBe(view.h - WORLD * scale - SLACK);
    const far = cameraOffset({ x: 1200, y: 0 }, scale, view, {
      x: 400,
      y: 300,
    });
    expect(far.x).toBe(view.w - WORLD * scale - SLACK);
    expect(far.y).toBe(SLACK);
  });

  it('centres a map that is smaller than the stage', () => {
    const camera = cameraOffset({ x: 5, y: 5 }, 0.5, view, { x: 10, y: 10 });
    expect(camera.x).toBe((view.w - WORLD * 0.5) / 2);
  });

  it('turns a click on the stage back into a map point', () => {
    const camera = { x: -300, y: -120 };
    const p = worldAt({ x: 450, y: 330 }, camera, 1.5);
    expect(p).toEqual({ x: 500, y: 300 });
  });

  it('draws the map bigger on a wide screen than on a phone', () => {
    expect(scaleFor({ w: 1440, h: 900 })).toBeGreaterThan(
      scaleFor({ w: 390, h: 800 }),
    );
  });
});

describe('the free part of the stage', () => {
  it('moves the focus left when the panel is open on a wide screen', async () => {
    const { focusFor } = await import('@/skins/moba/world/camera');
    const view = { w: 1440, h: 900 };
    const open = focusFor(view, true);
    const shut = focusFor(view, false);
    expect(open.x).toBeLessThan(shut.x);
    expect(open.y).toBe(shut.y);
    expect(open.x).toBeGreaterThan(76);
  });

  it('has no panel on a phone, where the page covers the whole stage', async () => {
    const { focusFor, insetsFor } = await import('@/skins/moba/world/camera');
    const view = { w: 390, h: 800 };
    expect(insetsFor(view, true).right).toBe(0);
    expect(focusFor(view, true).x).toBe(195);
  });
});
