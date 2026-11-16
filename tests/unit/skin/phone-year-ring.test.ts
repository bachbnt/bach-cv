/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import { RING_RADIUS, arcPath, ringOf } from '@/skins/phone/blocks/year-ring';

describe('the ring of the years widget', () => {
  it('has an arc for every year, from 2 to 24', () => {
    for (let years = 2; years <= 24; years++)
      expect(ringOf(years).arcs).toHaveLength(years);
  });

  it('is one unbroken circle for a single year and past 24 years, and empty for none', () => {
    expect(ringOf(1)).toMatchObject({ full: true, arcs: [] });
    expect(ringOf(25)).toMatchObject({ full: true, arcs: [] });
    expect(ringOf(40)).toMatchObject({ full: true, arcs: [] });
    expect(ringOf(0)).toMatchObject({ full: false, arcs: [] });
  });

  it('starts at the top, goes clockwise and leaves the same gap between every pair of arcs, the last one and the first included', () => {
    for (const years of [2, 7, 12, 13, 24]) {
      const { arcs } = ringOf(years);
      const gaps = arcs.map((arc, index) => {
        const next = arcs[(index + 1) % years];
        return (next.from - arc.to + 360) % 360;
      });
      for (const gap of gaps) expect(gap).toBeCloseTo(gaps[0], 6);
      expect(gaps[0]).toBeGreaterThan(0);
      expect(arcs[0].from).toBeCloseTo(gaps[0] / 2, 6);
      for (const arc of arcs) expect(arc.to).toBeGreaterThan(arc.from);
    }
  });

  it('covers the whole circle between the gaps: arcs and gaps add up to 360 degrees', () => {
    for (const years of [2, 7, 12, 13, 24]) {
      const { arcs } = ringOf(years);
      const drawn = arcs.reduce((sum, arc) => sum + arc.to - arc.from, 0);
      const gap = (360 - drawn) / years;
      expect(gap).toBeGreaterThan(0);
      expect(gap).toBeLessThan(10);
    }
  });

  it('makes the arcs thinner and the gaps smaller above 12 years', () => {
    expect(ringOf(12).stroke).toBeGreaterThan(ringOf(13).stroke);
    const wide = ringOf(12).arcs[0];
    const thin = ringOf(13).arcs[0];
    expect(wide.from).toBeGreaterThan(thin.from);
  });

  it('draws an arc as an SVG path that starts and ends on the circle', () => {
    expect(arcPath({ from: 0, to: 90 })).toBe(
      `M 50.00 ${(50 - RING_RADIUS).toFixed(2)} A ${RING_RADIUS} ${RING_RADIUS} 0 0 1 ${(50 + RING_RADIUS).toFixed(2)} 50.00`,
    );
    // more than half a turn takes the long way round
    expect(arcPath({ from: 0, to: 270 })).toContain(' 0 1 1 ');
  });
});
