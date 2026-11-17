/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import { foldOf, type ChipBox } from '@/skins/phone/blocks/tech-fold';

/** `perRow` chips of 28 px on each of `rows` rows, 8 px apart, as a flex-wrap lays them out. */
const wrapped = (rows: number, perRow: number): ChipBox[] =>
  Array.from({ length: rows * perRow }, (_, i) => ({
    top: Math.floor(i / perRow) * 36,
    height: 28,
  }));

describe('folding a list of chips to its first rows', () => {
  it('has nothing to fold when the list has the rows it shows or fewer', () => {
    expect(foldOf(wrapped(3, 4), 3)).toBeNull();
    expect(foldOf(wrapped(1, 4), 3)).toBeNull();
    expect(foldOf([], 3)).toBeNull();
  });

  it('folds to the bottom of the last row that shows, and hides from the first chip of the next', () => {
    expect(foldOf(wrapped(6, 4), 3)).toEqual({
      height: 2 * 36 + 28,
      hiddenFrom: 12,
    });
    expect(foldOf(wrapped(4, 5), 3)).toEqual({ height: 100, hiddenFrom: 15 });
  });

  it('counts a row by its top, so chips of different widths on one row are one row', () => {
    const boxes: ChipBox[] = [
      { top: 0, height: 28 },
      { top: 0.4, height: 28 },
      { top: 36, height: 28 },
      { top: 72, height: 28 },
      { top: 108, height: 28 },
    ];
    expect(foldOf(boxes, 3)).toEqual({ height: 100, hiddenFrom: 4 });
  });
});
