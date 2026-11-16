/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import {
  isBackSwipe,
  isDownDrag,
  isUpDrag,
  startsAtEdge,
} from '@/skins/phone/shell/gestures';

describe('the gestures of the Phone skin', () => {
  it('starts a swipe back only within 24 px of the left edge', () => {
    expect(startsAtEdge(110, 100)).toBe(true);
    expect(startsAtEdge(124, 100)).toBe(true);
    expect(startsAtEdge(125, 100)).toBe(false);
    expect(startsAtEdge(90, 100)).toBe(false);
  });

  it('counts a swipe back that is long and mostly horizontal', () => {
    expect(isBackSwipe(70, 10)).toBe(true);
    expect(isBackSwipe(69, 0)).toBe(false);
    expect(isBackSwipe(80, 60)).toBe(false);
    expect(isBackSwipe(-90, 0)).toBe(false);
  });

  it('counts a drag up (home) and a drag down (the shade) that is long and mostly vertical', () => {
    expect(isUpDrag(5, -48)).toBe(true);
    expect(isUpDrag(5, -47)).toBe(false);
    expect(isUpDrag(60, -50)).toBe(false);
    expect(isUpDrag(0, 80)).toBe(false);
    expect(isDownDrag(5, 48)).toBe(true);
    expect(isDownDrag(0, -80)).toBe(false);
    expect(isDownDrag(70, 50)).toBe(false);
  });
});
