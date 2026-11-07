/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import { layoutTreemap } from '@/skins/trade/blocks/data-treemap';

const items = [
  { id: 'a', value: 6 },
  { id: 'b', value: 6 },
  { id: 'c', value: 4 },
  { id: 'd', value: 3 },
  { id: 'e', value: 2 },
  { id: 'f', value: 2 },
  { id: 'g', value: 1 },
];

describe('layoutTreemap', () => {
  it('gives every item an area in proportion to its value', () => {
    const rects = layoutTreemap(items, 400, 300);
    const total = items.reduce((s, i) => s + i.value, 0);
    expect(rects).toHaveLength(items.length);
    for (const rect of rects) {
      const value = items.find((i) => i.id === rect.id)!.value;
      expect((rect.w * rect.h) / (400 * 300)).toBeCloseTo(value / total, 6);
    }
  });

  it('fills the box, stays inside it and never overlaps', () => {
    const rects = layoutTreemap(items, 400, 300);
    expect(rects.reduce((s, r) => s + r.w * r.h, 0)).toBeCloseTo(400 * 300, 4);
    for (const r of rects) {
      expect(r.x).toBeGreaterThanOrEqual(-1e-9);
      expect(r.y).toBeGreaterThanOrEqual(-1e-9);
      expect(r.x + r.w).toBeLessThanOrEqual(400 + 1e-9);
      expect(r.y + r.h).toBeLessThanOrEqual(300 + 1e-9);
    }
    rects.forEach((a, i) =>
      rects.slice(i + 1).forEach((b) => {
        const overlapX = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
        const overlapY = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
        expect(overlapX <= 1e-6 || overlapY <= 1e-6).toBe(true);
      }),
    );
  });

  it('is stable and puts the biggest first', () => {
    expect(layoutTreemap(items, 400, 300)).toEqual(
      layoutTreemap(items, 400, 300),
    );
    expect(layoutTreemap(items, 400, 300)[0].id).toBe('a');
  });

  it('keeps tiles reasonably square', () => {
    for (const r of layoutTreemap(items, 400, 300))
      expect(Math.max(r.w / r.h, r.h / r.w)).toBeLessThan(4);
  });

  it('fills the box with one item and returns nothing for no item or a flat box', () => {
    expect(layoutTreemap([{ id: 'x', value: 3 }], 100, 50)).toEqual([
      { id: 'x', x: 0, y: 0, w: 100, h: 50 },
    ]);
    expect(layoutTreemap([], 100, 50)).toEqual([]);
    expect(layoutTreemap(items, 0, 50)).toEqual([]);
  });

  it('leaves out an item with no value', () => {
    expect(
      layoutTreemap(
        [
          { id: 'x', value: 0 },
          { id: 'y', value: 2 },
        ],
        10,
        10,
      ).map((r) => r.id),
    ).toEqual(['y']);
  });
});
