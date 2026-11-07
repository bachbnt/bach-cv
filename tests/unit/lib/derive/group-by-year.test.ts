/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import { groupByYear } from '@/lib/derive/group-by-year';

const days = [
  '2026-10-31',
  '2026-05-01',
  '2025-12-02',
  '2025-01-09',
  '2023-06-30',
];

describe('groupByYear', () => {
  it('cuts the list into runs of the same year, keeping the order', () => {
    expect(groupByYear(days, (d) => d)).toEqual([
      { year: '2026', items: ['2026-10-31', '2026-05-01'] },
      { year: '2025', items: ['2025-12-02', '2025-01-09'] },
      { year: '2023', items: ['2023-06-30'] },
    ]);
  });

  it('reads a month as well as a day, and an empty list gives no group', () => {
    expect(groupByYear(['2024-03', '2024-01'], (d) => d)).toHaveLength(1);
    expect(groupByYear([], (d: string) => d)).toEqual([]);
  });
});
