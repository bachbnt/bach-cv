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
  isWalkable,
  nearestWalkable,
  routeTo,
  slide,
} from '@/skins/moba/world/ground';
import { pathLength, pointAtDistance } from '@/skins/moba/world/nav';
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

describe('the ground of the arena', () => {
  const stays = (path: { x: number; y: number }[]) => {
    for (let i = 1; i < path.length; i += 1) {
      const steps = Math.ceil(dist(path[i - 1], path[i]) / 10);
      for (let k = 0; k <= steps; k += 1) {
        const t = steps === 0 ? 0 : k / steps;
        const p = {
          x: path[i - 1].x + (path[i].x - path[i - 1].x) * t,
          y: path[i - 1].y + (path[i].y - path[i - 1].y) * t,
        };
        if (!isWalkable(p)) return false;
      }
    }
    return true;
  };

  it('lets the champion walk from the fountain to every station on walkable ground, and ends the walk on it', () => {
    for (const station of STATIONS) {
      expect(isWalkable(station.at)).toBe(true);
      const path = routeTo(BLUE_BASE, station.at);
      expect(path.length).toBeGreaterThan(0);
      expect(stays(path)).toBe(true);
      expect(dist(path[path.length - 1], station.at)).toBeLessThan(1);
    }
  });

  it('has a station for every page', () => {
    for (const page of PAGES) expect(stationOfPage(page).page).toBe(page);
    // two pits lead to Projects; the dragon pit is the one Projects is found at
    expect(stationOfPage('projects').id).toBe('dragon');
  });

  it('is open: the lanes, the river, the jungle and the bases are walkable, the canopy is not', () => {
    expect(isWalkable({ x: 118, y: 500 })).toBe(true); // top lane
    expect(isWalkable({ x: 450, y: 450 })).toBe(true); // river
    expect(isWalkable({ x: 310, y: 640 })).toBe(true); // west jungle
    expect(isWalkable({ x: 890, y: 560 })).toBe(true); // north jungle
    expect(isWalkable(BLUE_BASE)).toBe(true);
    expect(isWalkable({ x: 20, y: 600 })).toBe(false); // the wall beyond the top lane
    expect(isWalkable({ x: 300, y: 200 })).toBe(false); // the canopy between lane, river and jungle
    expect(isWalkable({ x: -5, y: 5 })).toBe(false);
  });

  it('goes straight to the baron pit through the river or the jungle, not around by the lanes', () => {
    const baron = stationOfPage('projects').at;
    const from = { x: 600, y: 600 };
    const target = { x: 330, y: 330 };
    expect(dist(baron, target)).toBeGreaterThan(0);
    const path = routeTo(from, target);
    expect(stays(path)).toBe(true);
    // the river runs from the centre to the pit: the walk is the straight line, give or take the bends of the river
    expect(pathLength(path)).toBeLessThan(dist(from, target) * 1.1);
  });

  it('cuts across the jungle from the fountain to the baron pit, much shorter than the way by the lanes', () => {
    const from = BLUE_BASE;
    const to = { x: 330, y: 330 };
    const path = routeTo(from, to);
    expect(stays(path)).toBe(true);
    expect(pathLength(path)).toBeLessThan(dist(from, to) * 1.35);
  });

  it('walks to the nearest walkable place when the target is on the canopy', () => {
    const wall = { x: 20, y: 600 };
    const near = nearestWalkable(wall);
    expect(isWalkable(near)).toBe(true);
    expect(dist(near, wall)).toBeLessThan(120);
    const path = routeTo(BLUE_BASE, wall);
    expect(isWalkable(path[path.length - 1])).toBe(true);
    expect(nearestWalkable({ x: 118, y: 500 })).toEqual({ x: 118, y: 500 });
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

  it('walks by hand into the jungle, slides along a wall, and stops in a corner', () => {
    const inLane = { x: 160, y: 500 };
    const east = slide(inLane, { x: 8, y: 0 });
    expect(east.x).toBeGreaterThan(inLane.x);
    // at the edge of the top lane, pushed into the wall and up the lane: it slides up
    const edge = { x: 60, y: 500 };
    const slid = slide(edge, { x: -8, y: -8 });
    expect(slid.x).toBe(edge.x);
    expect(slid.y).toBeLessThan(edge.y);
    expect(slide(edge, { x: -8, y: 0 })).toEqual(edge);
  });
});
