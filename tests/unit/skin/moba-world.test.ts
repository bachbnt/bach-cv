/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import {
  BLUE_BASE,
  RED_BASE,
  LANES,
  WORLD,
  decorTowers,
  dist,
  lengthOf,
  mirror,
  pointAlong,
  roleTowerSpots,
  roundedLine,
} from '@/skins/moba/world/geometry';
import {
  NAV,
  pathLength,
  pointAtDistance,
  routeTo,
  slide,
  snapToGraph,
} from '@/skins/moba/world/nav';
import { STATIONS, stationOfPage } from '@/skins/moba/world/stations';
import { PAGES } from '@/lib/content/schema';

describe('the geometry of the map', () => {
  it('is symmetric by a half turn, so the two bases are opposite corners', () => {
    expect(mirror(BLUE_BASE)).toEqual(RED_BASE);
    expect(BLUE_BASE.x).toBeLessThan(WORLD / 2);
    expect(BLUE_BASE.y).toBeGreaterThan(WORLD / 2);
    expect(mirror(mirror({ x: 12, y: 34 }))).toEqual({ x: 12, y: 34 });
  });

  it('rounds a corner without leaving the lane: the samples are at most a step apart', () => {
    const line = roundedLine(
      [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 100 },
      ],
      30,
    );
    for (let i = 1; i < line.samples.length; i += 1)
      expect(dist(line.samples[i - 1], line.samples[i])).toBeLessThanOrEqual(
        37,
      );
    expect(line.d.startsWith('M0 0')).toBe(true);
    expect(line.d).toContain('Q100 0');
    expect(line.samples[line.samples.length - 1]).toEqual({ x: 100, y: 100 });
  });

  it('puts a point at a fraction of a line by length', () => {
    const line = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
    ];
    expect(lengthOf(line)).toBe(200);
    expect(pointAlong(line, 0.25)).toEqual({ x: 50, y: 0 });
    expect(pointAlong(line, 0.75)).toEqual({ x: 100, y: 50 });
    expect(pointAlong(line, 5)).toEqual({ x: 100, y: 100 });
  });

  it('runs the top lane along the left and top edges and the bot lane along the bottom and right edges', () => {
    const top = LANES.top.samples;
    const bot = LANES.bot.samples;
    expect(top[0].x).toBeLessThan(200);
    expect(top[top.length - 1].y).toBeLessThan(200);
    expect(bot[0].y).toBeGreaterThan(1000);
    expect(bot[bot.length - 1].x).toBeGreaterThan(1000);
    // the mid lane is the diagonal
    for (const p of LANES.mid.samples)
      expect(Math.abs(p.x + p.y - 1200)).toBeLessThan(1);
  });

  it('has three towers on every lane of the blue side, two for each nexus, and gives every tower its own id', () => {
    const towers = decorTowers();
    const blue = towers.filter((t) => t.team === 'blue');
    expect(blue.filter((t) => t.kind !== 'nexus')).toHaveLength(9);
    expect(blue.filter((t) => t.kind === 'nexus')).toHaveLength(2);
    // the red mid lane is the career, so it has no decoration tower
    expect(
      towers.filter((t) => t.team === 'red' && t.id.includes('-mid-')),
    ).toHaveLength(0);
    expect(new Set(towers.map((t) => t.id)).size).toBe(towers.length);
  });

  it('spreads the towers of the career along the red half of the mid lane, in order', () => {
    expect(roleTowerSpots(0)).toEqual([]);
    const spots = roleTowerSpots(6);
    expect(spots).toHaveLength(6);
    for (let i = 1; i < spots.length; i += 1)
      expect(spots[i].x).toBeGreaterThan(spots[i - 1].x);
    expect(spots[0].x).toBeGreaterThan(WORLD / 2);
  });
});

describe('the navigation graph', () => {
  it('lets the champion walk from the fountain to every station, and ends the walk on it', () => {
    for (const station of STATIONS) {
      const path = routeTo(BLUE_BASE, station.at);
      expect(path.length).toBeGreaterThan(0);
      expect(Number.isFinite(pathLength(path))).toBe(true);
      expect(dist(path[path.length - 1], station.at)).toBeLessThan(1);
    }
  });

  it('has a station for every page', () => {
    for (const page of PAGES) expect(stationOfPage(page).page).toBe(page);
    // two pits lead to Projects; the dragon pit is the one Projects is found at
    expect(stationOfPage('projects').id).toBe('dragon');
  });

  it('walks along the lanes, not across the jungle: a walk is never much shorter than the lanes allow', () => {
    const straight = dist(BLUE_BASE, RED_BASE);
    const path = routeTo(BLUE_BASE, RED_BASE);
    expect(pathLength(path)).toBeGreaterThanOrEqual(straight - 1);
    // the mid lane is the shortest way across, so the walk stays near the straight line
    expect(pathLength(path)).toBeLessThan(straight * 1.2);
  });

  it('snaps a point off the lanes to the nearest lane', () => {
    const spot = snapToGraph({ x: 600, y: 640 });
    expect(dist(spot.at, { x: 600, y: 640 })).toBeLessThan(40);
    const onGraph = NAV.nodes.some((n) => dist(n, spot.at) < 40);
    expect(onGraph).toBe(true);
  });

  it('finds the point after a distance of a path, and stops at its end', () => {
    const path = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
    ];
    expect(pointAtDistance(path, 5)).toEqual({ x: 5, y: 0 });
    expect(pointAtDistance(path, 15)).toEqual({ x: 10, y: 5 });
    expect(pointAtDistance(path, 99)).toEqual({ x: 10, y: 10 });
    expect(pointAtDistance(path, -3)).toEqual({ x: 0, y: 0 });
  });

  it('slides along a lane when walked by hand, and stays still when pushed across it', () => {
    const start = { x: 118, y: 500 };
    const up = slide(start, { x: 0, y: -8 });
    expect(up.y).toBeLessThan(start.y);
    expect(Math.abs(up.x - 118)).toBeLessThan(1);
    const across = slide(start, { x: -8, y: 0 });
    expect(Math.abs(across.y - start.y)).toBeLessThan(1);
  });
});
