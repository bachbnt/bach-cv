/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import { kindCounts } from '@/lib/derive/payment-kinds';

describe('kindCounts', () => {
  it('counts every method of each kind, in the order of the filter', () => {
    const methods = [
      { kind: 'wallet' as const },
      { kind: 'bank' as const },
      { kind: 'wallet' as const },
    ];
    expect(kindCounts(methods)).toEqual({
      total: 3,
      kinds: [
        { kind: 'bank', count: 1 },
        { kind: 'wallet', count: 2 },
      ],
    });
  });

  it('leaves out a kind that has none', () => {
    expect(kindCounts([{ kind: 'bank' as const }]).kinds).toEqual([
      { kind: 'bank', count: 1 },
    ]);
  });

  it('is empty for no methods', () => {
    expect(kindCounts([])).toEqual({ total: 0, kinds: [] });
  });
});
