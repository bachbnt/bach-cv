/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import { groupByKind, kindCounts } from '@/lib/derive/payment-kinds';

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

describe('groupByKind', () => {
  it('groups the methods by kind in the order of the filter and keeps their order inside a group', () => {
    const methods = [
      { id: 'a', kind: 'wallet' as const },
      { id: 'b', kind: 'bank' as const },
      { id: 'c', kind: 'wallet' as const },
    ];
    expect(groupByKind(methods)).toEqual([
      { kind: 'bank', methods: [{ id: 'b', kind: 'bank' }] },
      {
        kind: 'wallet',
        methods: [
          { id: 'a', kind: 'wallet' },
          { id: 'c', kind: 'wallet' },
        ],
      },
    ]);
  });

  it('leaves out a kind that has none, and is empty for no methods', () => {
    expect(groupByKind([{ kind: 'wallet' as const }])).toHaveLength(1);
    expect(groupByKind([])).toEqual([]);
  });
});
