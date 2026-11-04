/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import { paginate } from '@/lib/cv/paginate';

describe('paginate', () => {
  it('returns one empty page for no blocks', () => {
    expect(paginate([], 100)).toEqual([[]]);
  });

  it('fills a page until the next block does not fit', () => {
    const blocks = [40, 40, 40, 40].map((height) => ({ height }));
    expect(paginate(blocks, 100)).toEqual([
      [0, 1],
      [2, 3],
    ]);
  });

  it('fits a block that exactly fills the page', () => {
    const blocks = [50, 50, 10].map((height) => ({ height }));
    expect(paginate(blocks, 100)).toEqual([[0, 1], [2]]);
  });

  it('moves a heading to the next page with the block that follows it', () => {
    const blocks = [
      { height: 80 },
      { height: 10, keepWithNext: true },
      { height: 30 },
    ];
    expect(paginate(blocks, 100)).toEqual([[0], [1, 2]]);
  });

  it('keeps a heading when the next block fits beside it', () => {
    const blocks = [
      { height: 50 },
      { height: 10, keepWithNext: true },
      { height: 30 },
    ];
    expect(paginate(blocks, 100)).toEqual([[0, 1, 2]]);
  });

  it('gives a block taller than a page a page of its own', () => {
    const blocks = [{ height: 30 }, { height: 500 }, { height: 30 }];
    expect(paginate(blocks, 100)).toEqual([[0], [1], [2]]);
  });

  it('never starts with an empty page', () => {
    expect(paginate([{ height: 500 }], 100)).toEqual([[0]]);
  });
});
