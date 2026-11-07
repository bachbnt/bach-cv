/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import { spreadFlags } from '@/skins/trade/chart/flag-spread';

describe('spreadFlags', () => {
  it('leaves flags that are far apart where they are', () => {
    expect(spreadFlags([100, 300, 500], 24, 800)).toEqual([100, 300, 500]);
  });

  it('spreads two flags on the same bar around it', () => {
    expect(spreadFlags([200, 200], 24, 800)).toEqual([188, 212]);
  });

  it('spreads flags that are only a few pixels apart, not just those on one bar', () => {
    const [a, b] = spreadFlags([400, 410], 24, 800);
    expect(b - a).toBeGreaterThanOrEqual(24);
  });

  it('keeps the order of the answers with the order of the flags asked', () => {
    const out = spreadFlags([500, 100, 505], 24, 800);
    expect(out[1]).toBe(100);
    expect(out[2] - out[0]).toBeGreaterThanOrEqual(24);
    expect(out[2]).toBeGreaterThan(out[0]);
  });

  it('keeps a group inside the plot at both edges', () => {
    const left = spreadFlags([0, 0, 0], 24, 800);
    expect(left).toEqual([12, 36, 60]);
    const right = spreadFlags([800, 800], 24, 800);
    expect(right).toEqual([764, 788]);
  });
});
