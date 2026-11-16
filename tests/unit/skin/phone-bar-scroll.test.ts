/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import {
  BAR_FOLLOW_AFTER,
  barFollow,
  barOpacity,
  barSettle,
  barTail,
  BAR_TAIL,
  barStart,
  largeTitleOpacity,
  type BarFollow,
} from '@/skins/phone/shell/bar-scroll';

const H = 84;
const through = (start: BarFollow, tops: number[]) =>
  tops.reduce((state, top) => barFollow(state, top, H), start);

describe('the app bar follows the page', () => {
  it('slides up by as much as the page goes down, and does not start in the first stretch', () => {
    expect(through(barStart(0), [10, BAR_FOLLOW_AFTER]).y).toBe(0);
    expect(through(barStart(0), [40, 60]).y).toBe(-60);
    expect(through(barStart(100), [130]).y).toBe(-30);
  });

  it('slides back by as much as the page comes up, and is in place at the top', () => {
    const away = through(barStart(0), [40, 100]);
    expect(away.y).toBe(-H);
    expect(through(away, [90]).y).toBe(-74);
    expect(through(away, [0]).y).toBe(0);
  });

  it('never goes past its place or past the height that takes it out of sight', () => {
    expect(through(barStart(0), [40, 500]).y).toBe(-H);
    expect(through(through(barStart(0), [40, 500]), [900, 100]).y).toBe(0);
  });

  it('settles all the way in place or all the way out of sight, whichever is nearer', () => {
    expect(barSettle(-41, H)).toBe(0);
    expect(barSettle(-43, H)).toBe(-H);
    expect(barSettle(0, H)).toBe(0);
    expect(barSettle(-H, H)).toBe(-H);
  });

  it('fades before it is out of sight', () => {
    expect(barOpacity(0, H)).toBe(1);
    expect(barOpacity(-H, H)).toBe(0);
    expect(barOpacity(-H * 0.3, H)).toBeCloseTo(0.5);
  });
});

describe('the large title under the app bar', () => {
  it('is whole while it is all below the bar and gone before it reaches the text of the bar', () => {
    expect(largeTitleOpacity(1)).toBe(1);
    expect(largeTitleOpacity(0.7)).toBe(0);
    expect(largeTitleOpacity(0)).toBe(0);
  });

  it('fades in proportion to what is hidden, not all at once', () => {
    const steps = [1, 0.95, 0.9, 0.85, 0.8, 0.75].map(largeTitleOpacity);
    for (let i = 1; i < steps.length; i++)
      expect(steps[i]).toBeLessThan(steps[i - 1]);
    // a fifth of it under the bar is already nearly gone
    expect(largeTitleOpacity(0.8)).toBeLessThanOrEqual(0.15);
  });
});

describe('the settling of the bar when the scrolling stops', () => {
  const H = 84;
  it('puts the bar in place when the last move was up, wherever it is', () => {
    for (const y of [-H, -H + 1, -50, -43, -41, -10, 0])
      expect(barSettle(y, H, true)).toBe(0);
  });
  it('after a move down, puts it in place when it is more than half there and takes it away when it is not', () => {
    expect(barSettle(-41, H, false)).toBe(0);
    expect(barSettle(-42, H, false)).toBe(-H);
    expect(barSettle(-60, H, false)).toBe(-H);
    expect(barSettle(-H, H, false)).toBe(-H);
    expect(barSettle(0, H, false)).toBe(0);
  });
  it('never leaves the bar part of the way, whichever way it was going', () => {
    for (const up of [true, false])
      for (let y = -H; y <= 0; y++)
        expect([0, -H]).toContain(barSettle(y, H, up));
  });
});

describe('the soft end of the veil of the bar', () => {
  const H = 84;
  it('is all there until the bar is within its own length of being out of sight, then goes', () => {
    expect(barTail(0, H)).toBe(1);
    expect(barTail(-H + BAR_TAIL, H)).toBe(1);
    expect(barTail(-H + BAR_TAIL / 2, H)).toBeCloseTo(0.5);
    expect(barTail(-H, H)).toBe(0);
  });
});
