/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import { SWIPE_DISTANCE, swipeStep } from '@/skins/phone/shell/swipe-step';

describe('the swipe of the viewer of the Phone skin', () => {
  it('shows the next picture when the finger goes left and the previous one when it goes right', () => {
    expect(swipeStep(-120, 4)).toBe(1);
    expect(swipeStep(120, -4)).toBe(-1);
  });

  it('ignores a short stroke, which is a tap', () => {
    expect(swipeStep(SWIPE_DISTANCE - 1, 0)).toBe(0);
    expect(swipeStep(-(SWIPE_DISTANCE - 1), 0)).toBe(0);
    expect(swipeStep(0, 0)).toBe(0);
  });

  it('counts a stroke from the distance on', () => {
    expect(swipeStep(-SWIPE_DISTANCE, 0)).toBe(1);
    expect(swipeStep(SWIPE_DISTANCE, 0)).toBe(-1);
  });

  it('ignores a stroke that is more up and down than sideways, which is a scroll', () => {
    expect(swipeStep(-60, 90)).toBe(0);
    expect(swipeStep(60, -60)).toBe(0);
    expect(swipeStep(-90, 50)).toBe(1);
  });
});
