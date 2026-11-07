/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import {
  canPreview,
  nextFrame,
  PREVIEW_MS,
} from '@/skins/stream/blocks/career-preview';

describe('the hover preview of a project', () => {
  it('shows a screenshot for about 900 ms', () => {
    expect(PREVIEW_MS).toBe(900);
  });

  it('goes to the next screenshot and round again after the last one', () => {
    expect([0, 1, 2].map((f) => nextFrame(f, 3))).toEqual([1, 2, 0]);
    expect(nextFrame(0, 1)).toBe(0);
    expect(nextFrame(5, 0)).toBe(0);
  });

  it('needs a screenshot, a mouse and a visitor who has not asked for less motion', () => {
    const base = { images: ['a.png'], mouse: true, reducedMotion: false };
    expect(canPreview(base)).toBe(true);
    expect(canPreview({ ...base, images: [] })).toBe(false);
    expect(canPreview({ ...base, mouse: false })).toBe(false);
    expect(canPreview({ ...base, reducedMotion: true })).toBe(false);
  });
});
