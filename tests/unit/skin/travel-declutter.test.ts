/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import { hiddenLabels } from '@/skins/travel/map/declutter';

const box = (x: number, y: number, w = 100, h = 20) => ({ x, y, w, h });

describe('leaving out name tags that lie on other text', () => {
  it('keeps tags that touch nothing', () => {
    const labels = [
      { id: 'a', box: box(0, 0), rank: 0 },
      { id: 'b', box: box(0, 100), rank: 1 },
    ];
    expect(hiddenLabels(labels, []).size).toBe(0);
  });

  it('drops the less important of two tags that overlap, whatever their order', () => {
    const labels = [
      { id: 'minor', box: box(50, 5), rank: 5 },
      { id: 'major', box: box(0, 0), rank: 1 },
    ];
    expect([...hiddenLabels(labels, [])]).toEqual(['minor']);
  });

  it('drops a tag that lies on a card of a stop, which always stays', () => {
    const labels = [{ id: 'tag', box: box(0, 0), rank: 0 }];
    expect([...hiddenLabels(labels, [box(80, 10, 120, 40)])]).toEqual(['tag']);
  });

  it('keeps a tag that a dropped tag would have covered', () => {
    const labels = [
      { id: 'one', box: box(0, 0), rank: 0 },
      { id: 'two', box: box(90, 0), rank: 1 },
      { id: 'three', box: box(180, 0), rank: 2 },
    ];
    // two touches one and is dropped; three touches only two, so it stays
    expect([...hiddenLabels(labels, [], 4)]).toEqual(['two']);
  });

  it('keeps a gap between tags', () => {
    const labels = [
      { id: 'a', box: box(0, 0), rank: 0 },
      { id: 'b', box: box(102, 0), rank: 1 },
    ];
    expect(hiddenLabels(labels, [], 4).has('b')).toBe(true);
    expect(hiddenLabels(labels, [], 0).has('b')).toBe(false);
  });
});
