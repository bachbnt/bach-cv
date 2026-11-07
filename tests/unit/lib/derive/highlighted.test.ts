/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import { highlighted } from '@/lib/derive/highlighted';

describe('highlighted', () => {
  it('keeps the ranked items in rank order, and drops the others', () => {
    const items = [
      { id: 'a', highlight: 3 },
      { id: 'b', highlight: null },
      { id: 'c', highlight: 1 },
      { id: 'd', highlight: 2 },
    ];
    expect(highlighted(items).map((i) => i.id)).toEqual(['c', 'd', 'a']);
    expect(items.map((i) => i.id)).toEqual(['a', 'b', 'c', 'd']);
  });

  it('keeps the order of equal ranks', () => {
    const items = [
      { id: 'x', highlight: 1 },
      { id: 'y', highlight: 1 },
    ];
    expect(highlighted(items).map((i) => i.id)).toEqual(['x', 'y']);
  });
});
