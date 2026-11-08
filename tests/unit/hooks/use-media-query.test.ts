/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { afterEach, describe, expect, it, vi } from 'vitest';
import { watchMedia } from '@/hooks/use-media-query';

afterEach(() => vi.unstubAllGlobals());

function fakeWindow(matches: boolean) {
  const listeners = new Set<() => void>();
  const asked: string[] = [];
  vi.stubGlobal('window', {
    matchMedia: (query: string) => {
      asked.push(query);
      return {
        matches,
        addEventListener: (_: string, fn: () => void) => listeners.add(fn),
        removeEventListener: (_: string, fn: () => void) =>
          listeners.delete(fn),
      };
    },
  });
  return { listeners, asked };
}

describe('watchMedia', () => {
  it('reads the query it was made for', () => {
    const { asked } = fakeWindow(true);
    expect(watchMedia('(pointer: coarse)').snapshot()).toBe(true);
    expect(asked).toEqual(['(pointer: coarse)']);
  });

  it('listens to changes and stops when unsubscribed', () => {
    const { listeners } = fakeWindow(false);
    const stop = watchMedia('(min-width: 1101px)').subscribe(() => undefined);
    expect(listeners.size).toBe(1);
    stop();
    expect(listeners.size).toBe(0);
  });
});
