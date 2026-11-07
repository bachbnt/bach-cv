/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import {
  MAX_PENDING_ZOOM,
  queueZoom,
  takeStep,
  WHEEL_MAX_DELTA,
  wheelPixels,
  wheelZoomLog,
} from '@/skins/trade/chart/wheel-zoom';

describe('the wheel of the chart', () => {
  it('turns lines and pages into pixels and never lets one event be a jump', () => {
    expect(wheelPixels(100, 0)).toBe(100);
    expect(wheelPixels(3, 1)).toBe(48);
    expect(wheelPixels(1, 2)).toBe(WHEEL_MAX_DELTA);
    expect(wheelPixels(5000, 0)).toBe(WHEEL_MAX_DELTA);
    expect(wheelPixels(-5000, 0)).toBe(-WHEEL_MAX_DELTA);
  });

  it('zooms about fifteen percent for a notch of a mouse wheel, not seventeen in one jump', () => {
    const factor = Math.exp(wheelZoomLog(100, false));
    expect(factor).toBeGreaterThan(1.13);
    expect(factor).toBeLessThan(1.17);
    // a pinch (Ctrl) has small deltas: each pixel counts more
    expect(wheelZoomLog(10, true)).toBeGreaterThan(wheelZoomLog(10, false));
    expect(wheelZoomLog(-100, false)).toBeLessThan(0);
  });

  it('keeps what a fast spin queued up within a limit', () => {
    let queued = 0;
    for (let i = 0; i < 100; i += 1)
      queued = queueZoom(queued, wheelZoomLog(WHEEL_MAX_DELTA, false));
    expect(queued).toBe(MAX_PENDING_ZOOM);
    expect(queueZoom(0, -10)).toBe(-MAX_PENDING_ZOOM);
  });

  it('applies a share of the queue each frame, so the window glides and arrives', () => {
    let pending = 0.18;
    const steps: number[] = [];
    for (let frame = 0; frame < 40; frame += 1) {
      const step = takeStep(pending, 16, false);
      steps.push(step);
      pending -= step;
    }
    // it moves in several frames, fastest at first, and does not overshoot
    expect(steps[0]).toBeGreaterThan(0);
    expect(steps[0]).toBeLessThan(0.18);
    expect(steps[1]).toBeLessThan(steps[0]);
    expect(steps.filter((step) => step > 0.001).length).toBeGreaterThan(8);
    expect(Math.abs(pending)).toBeLessThan(0.003);
    expect(steps.reduce((sum, step) => sum + step, 0)).toBeCloseTo(0.18, 2);
  });

  it('does not depend on the frame rate much and never takes a huge step after a stall', () => {
    const slow = takeStep(0.2, 33, false);
    const fast = takeStep(0.2, 16, false);
    expect(slow).toBeGreaterThan(fast);
    // a stalled frame (a tab that was hidden) counts as 64 ms at most
    expect(takeStep(0.2, 5000, false)).toBeLessThan(0.2 * 0.6);
  });

  it('applies everything at once with reduced motion', () => {
    expect(takeStep(0.2, 16, true)).toBe(0.2);
  });
});
