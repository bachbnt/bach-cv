/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import {
  CASTS,
  aimFrom,
  cellsAround,
  NOVA_RADIUS,
} from '@/skins/moba/world/abilities';
import { WORLD } from '@/skins/moba/world/geometry';
import {
  DEAD_ZONE,
  PINGS,
  slicePoint,
  sliceAt,
} from '@/skins/moba/world/pings';

describe('where a cast lands', () => {
  const from = { x: 600, y: 600 };

  it('is the aim itself when it is within range', () => {
    const aim = aimFrom(from, { x: 700, y: 600 }, 420);
    expect(aim.to).toEqual({ x: 700, y: 600 });
    expect(aim.length).toBeCloseTo(100);
    expect(aim.angle).toBeCloseTo(0);
  });

  it('stops at the range on the line to a faraway aim', () => {
    const aim = aimFrom(from, { x: 600, y: 1100 }, 260);
    expect(aim.to.x).toBeCloseTo(600);
    expect(aim.to.y).toBeCloseTo(860);
    expect(aim.angle).toBeCloseTo(Math.PI / 2);
  });

  it('goes to the right with no aim, and stays on the champion for a range of 0', () => {
    expect(aimFrom(from, null, 300).to).toEqual({ x: 900, y: 600 });
    expect(aimFrom(from, { x: 10, y: 10 }, 0).length).toBe(0);
  });

  it('never leaves the arena', () => {
    const aim = aimFrom({ x: 1180, y: 20 }, { x: 5000, y: -5000 }, 400);
    expect(aim.to.x).toBeLessThanOrEqual(WORLD);
    expect(aim.to.y).toBeGreaterThanOrEqual(0);
  });

  it('has one cast for each of the keys Q W E R, with a cooldown', () => {
    expect(CASTS.map((c) => c.kind)).toEqual(['bolt', 'aura', 'dash', 'nova']);
    for (const cast of CASTS) expect(cast.cooldownMs).toBeGreaterThan(0);
  });
});

describe('the cells the wave of R reveals', () => {
  it('are the ones whose centre is within the radius, inside the arena', () => {
    const cells = cellsAround({ x: 600, y: 600 }, NOVA_RADIUS, 90);
    expect(cells).toContain('6,6');
    expect(cells).not.toContain('0,0');
    expect(new Set(cells).size).toBe(cells.length);
  });

  it('does not invent cells past the edge of the arena', () => {
    const cells = cellsAround({ x: 20, y: 20 }, 300, 90);
    expect(cells.every((c) => c.split(',').every((n) => Number(n) >= 0))).toBe(
      true,
    );
  });
});

describe('the slices of the ping wheel', () => {
  const n = PINGS.length;

  it('are none on the middle, and one for each side around it', () => {
    expect(sliceAt(0, 0, n)).toBeNull();
    expect(sliceAt(DEAD_ZONE - 1, 0, n)).toBeNull();
    expect(sliceAt(0, -60, n)).toBe(0);
    expect(sliceAt(60, 0, n)).toBe(1);
    expect(sliceAt(0, 60, n)).toBe(2);
    expect(sliceAt(-60, 0, n)).toBe(3);
  });

  it('put the point of a slice back into the same slice', () => {
    for (let i = 0; i < n; i++) {
      const p = slicePoint(i, n);
      expect(sliceAt(p.x, p.y, n)).toBe(i);
    }
  });

  it('have the four pings of the site, in order', () => {
    expect(PINGS).toEqual(['alert', 'onMyWay', 'retreat', 'assist']);
  });
});
