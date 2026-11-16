/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import { vtClip } from '@/skins/phone/shell/vt-clip';

describe('the clip of a page change in a device', () => {
  it('cuts the viewport to the box of the display, with its four corners', () => {
    expect(
      vtClip(
        { left: 440, top: 54, right: 1000, bottom: 846 },
        { width: 1440, height: 900 },
        [4, 34, 34, 4],
      ),
    ).toBe('inset(54px 440px 54px 440px round 4px 34px 34px 4px)');
  });

  it('keeps fractions to two places', () => {
    expect(
      vtClip(
        { left: 100.126, top: 10, right: 1100, bottom: 800.004 },
        { width: 1200, height: 900 },
        [27.2, 27.2, 27.2, 27.2],
      ),
    ).toBe(
      'inset(10px 100px 100px 100.13px round 27.2px 27.2px 27.2px 27.2px)',
    );
  });
});
