/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import { separateMagnets, type MagnetBox } from '@/lib/magnet-overlaps';

const box = (over: Partial<MagnetBox>): MagnetBox => ({
  cx: 0,
  cy: 0,
  w: 100,
  h: 30,
  tx: 0,
  ty: 0,
  s: 1,
  ...over,
});

/** The space between two boxes on the x axis (negative: they overlap). */
const spaceX = (a: MagnetBox, b: MagnetBox) =>
  b.cx + b.tx - (a.cx + a.tx) - (a.w * a.s + b.w * b.s) / 2;

describe('separateMagnets', () => {
  it('leaves chips that do not touch where they are', () => {
    const a = box({ cx: 0, tx: 3 });
    const b = box({ cx: 120, tx: -3 });
    separateMagnets([a, b], 4);
    expect([a.tx, b.tx]).toEqual([3, -3]);
  });

  it('pushes two chips pulled toward each other apart, half each, up to the gap', () => {
    // at rest there are 10px between them; each is pulled 11px toward the middle: they overlap by 12px
    const a = box({ cx: 0, tx: 11 });
    const b = box({ cx: 110, tx: -11 });
    separateMagnets([a, b], 4);
    expect(spaceX(a, b)).toBeCloseTo(4, 5);
    // both still lean toward the middle, and by the same amount
    expect(a.tx).toBeGreaterThan(0);
    expect(b.tx).toBeLessThan(0);
    expect(a.tx).toBeCloseTo(-b.tx, 5);
  });

  it('counts the growth of a chip as part of its size', () => {
    const a = box({ cx: 0, tx: 5, s: 1.07 });
    const b = box({ cx: 110, tx: -5, s: 1.07 });
    separateMagnets([a, b], 4);
    expect(spaceX(a, b)).toBeGreaterThanOrEqual(4 - 1e-9);
  });

  it('keeps the order of the chips from where they rest, even if the pull has crossed them', () => {
    const a = box({ cx: 0, tx: 70 });
    const b = box({ cx: 110, tx: -70 });
    separateMagnets([a, b], 4);
    expect(a.cx + a.tx).toBeLessThan(b.cx + b.tx);
    expect(spaceX(a, b)).toBeGreaterThanOrEqual(4 - 1e-9);
  });

  it('settles a row of three chips', () => {
    const boxes = [
      box({ cx: 0, tx: 11 }),
      box({ cx: 110 }),
      box({ cx: 220, tx: -11 }),
    ];
    separateMagnets(boxes, 4);
    expect(spaceX(boxes[0], boxes[1])).toBeGreaterThanOrEqual(4 - 0.01);
    expect(spaceX(boxes[1], boxes[2])).toBeGreaterThanOrEqual(4 - 0.01);
  });

  it('separates chips of two rows on the y axis', () => {
    // one below the other: 8px apart at rest, pulled 11px toward each other
    const a = box({ cx: 0, cy: 0, ty: 11 });
    const b = box({ cx: 0, cy: 38, ty: -11 });
    separateMagnets([a, b], 4);
    const space = b.cy + b.ty - (a.cy + a.ty) - 30;
    expect(space).toBeGreaterThanOrEqual(4 - 1e-9);
    expect(a.tx).toBe(0);
    expect(b.tx).toBe(0);
  });
});
