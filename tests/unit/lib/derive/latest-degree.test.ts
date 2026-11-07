/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import { latestDegree } from '@/lib/derive/latest-degree';

describe('latestDegree', () => {
  it('is the degree that started last, whatever the order given', () => {
    const degrees = [
      { id: 'bsc', startMonth: '2014-09' },
      { id: 'msc', startMonth: '2021-09' },
    ];
    expect(latestDegree(degrees)?.id).toBe('msc');
    expect(latestDegree([...degrees].reverse())?.id).toBe('msc');
    expect(degrees[0].id).toBe('bsc');
  });

  it('is undefined with no degree', () => {
    expect(latestDegree([])).toBeUndefined();
  });
});
