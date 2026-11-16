/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import {
  dragDismisses,
  dragOffset,
  DRAG_SLOP,
} from '@/skins/phone/shell/ph-overlay-drag';

describe('the drag that closes a sheet of the Phone skin', () => {
  it('closes after more than a third of the height, however slowly', () => {
    expect(dragDismisses(301, 2000, 900)).toBe(true);
    expect(dragDismisses(299, 2000, 900)).toBe(false);
  });

  it('closes after a quick flick down, even a short one', () => {
    expect(dragDismisses(60, 80, 900)).toBe(true);
    expect(dragDismisses(60, 400, 900)).toBe(false);
  });

  it('does not count a tiny movement as a flick', () => {
    expect(dragDismisses(DRAG_SLOP, 1, 900)).toBe(false);
  });

  it('never closes on a drag up or on a sheet of no height', () => {
    expect(dragDismisses(-400, 50, 900)).toBe(false);
    expect(dragDismisses(0, 50, 900)).toBe(false);
    expect(dragDismisses(100, 50, 0)).toBe(false);
  });

  it('follows the pointer down only', () => {
    expect(dragOffset(42)).toBe(42);
    expect(dragOffset(-42)).toBe(0);
  });
});
