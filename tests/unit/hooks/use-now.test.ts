/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { afterEach, describe, expect, it, vi } from 'vitest';
import { stableNow } from '@/hooks/use-now';

afterEach(() => vi.useRealTimers());

describe('stableNow', () => {
  it('is one object for the whole month, so every block agrees', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2031, 2, 2, 9));
    const first = stableNow();
    vi.setSystemTime(new Date(2031, 2, 28, 23));
    expect(stableNow()).toBe(first);
  });

  it('moves to a new object when the month changes, and follows a faked clock', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2032, 0, 31, 23));
    const january = stableNow();
    vi.setSystemTime(new Date(2032, 1, 1, 0, 5));
    const february = stableNow();
    expect(february).not.toBe(january);
    expect(february.getMonth()).toBe(1);
    expect(february.getFullYear()).toBe(2032);
  });
});
