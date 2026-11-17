/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import {
  boxAt,
  clampInside,
  CROSS,
  crossOpacity,
  easeAt,
  inset,
  isInside,
  iconScale,
  RECEDE,
  relativeTo,
  ZOOM_CURVE,
  ZOOM_EASING,
  ZOOM_MS,
  zoomPlan,
  type Box,
} from '@/skins/phone/shell/app-zoom';

const view: Box = { x: 0, y: 0, width: 560, height: 792 };
const icon: Box = { x: 420, y: 130, width: 58, height: 58 };
const size = { width: 560, height: 792 };

describe('the zoom of an app out of its icon', () => {
  it('takes 360 ms, with a curve that starts gently and never goes past the end', () => {
    expect(ZOOM_MS).toBeGreaterThanOrEqual(320);
    expect(ZOOM_MS).toBeLessThanOrEqual(400);
    // no control point beyond 0 and 1: the curve cannot overshoot, so the box cannot go past the window
    for (const value of ZOOM_CURVE) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(1);
    }
    expect(ZOOM_EASING).toBe('cubic-bezier(0.3, 0.55, 0.1, 1)');
    // it grows from the first frames, but does not jump: at the first frame of a 60 Hz screen it has done a tenth of its way
    expect(easeAt(16 / ZOOM_MS)).toBeLessThan(0.15);
    expect(easeAt(16 / ZOOM_MS)).toBeGreaterThan(0.03);
  });

  it('is 0 at the start and 1 at the end, and only ever grows, never past 1', () => {
    expect(easeAt(0)).toBe(0);
    expect(easeAt(1)).toBe(1);
    let before = 0;
    for (let i = 1; i <= 200; i++) {
      const value = easeAt(i / 200);
      expect(value).toBeGreaterThanOrEqual(before);
      expect(value).toBeLessThanOrEqual(1);
      before = value;
    }
  });

  it('shows the icon at its start and the window at its end, and a box between that is inside the window at every moment', () => {
    expect(boxAt(icon, view, 0)).toEqual(icon);
    expect(boxAt(icon, view, 1)).toEqual(view);
    expect(isInside(icon, view)).toBe(true);
    for (let i = 0; i <= 200; i++) {
      const box = boxAt(icon, view, easeAt(i / 200));
      expect(isInside(box, view, 0.001), `at ${i / 2}%`).toBe(true);
      // and it is never smaller than the icon
      expect(box.width).toBeGreaterThanOrEqual(icon.width - 0.001);
    }
  });

  it('scales the app as it was laid out, by the width of the box: its left and right edges follow those of the box, and it is never stretched', () => {
    const plan = zoomPlan({
      icon,
      view,
      size,
      iconCorners: [17.4, 17.4, 17.4, 17.4],
      viewCorners: [4, 34, 34, 4],
    });
    expect(iconScale(icon, view)).toBeCloseTo(58 / 560, 6);
    expect(plan.content[0]).toBe(
      `translate(420px, 130px) scale(${Math.round((58 / 560) * 10000) / 10000})`,
    );
    expect(plan.content[1]).toBe('translate(0px, 0px) scale(1)');
    // the box is cut to the icon with the corners of the icon, then to the window with the corners of the display
    expect(plan.clip[0]).toBe(
      'inset(130px 82px 604px 420px round 17.4px 17.4px 17.4px 17.4px)',
    );
    expect(plan.clip[1]).toBe('inset(0px 0px 0px 0px round 4px 34px 34px 4px)');
  });

  it('cuts a page that is taller than the window (a window of a phone) to the window, not to the page', () => {
    // the page is 2400 px tall, the window 844: the box is cut from the bottom by what lies below the window
    const tall = { width: 390, height: 2400 };
    const window: Box = { x: 0, y: 0, width: 390, height: 844 };
    const plan = zoomPlan({
      icon: { x: 40, y: 500, width: 58, height: 58 },
      view: window,
      size: tall,
      iconCorners: [17.4, 17.4, 17.4, 17.4],
      viewCorners: [0, 0, 0, 0],
    });
    expect(plan.clip[1]).toBe(
      'inset(0px 0px 1556px 0px round 0px 0px 0px 0px)',
    );
  });

  it('gives a box in the system of the window, divided by the scale a device is drawn at', () => {
    const rect: Box = { x: 360, y: 250, width: 40, height: 40 };
    const origin: Box = { x: 200, y: 100, width: 480, height: 600 };
    expect(relativeTo(rect, origin, 1)).toEqual({
      x: 160,
      y: 150,
      width: 40,
      height: 40,
    });
    expect(relativeTo(rect, origin, 0.8)).toEqual({
      x: 200,
      y: 187.5,
      width: 50,
      height: 50,
    });
  });

  it('moves the icon of an app that is below the fold of the home screen to the edge of the window, without resizing it', () => {
    const window: Box = { x: 0, y: 0, width: 320, height: 700 };
    expect(
      clampInside({ x: 100, y: 900, width: 58, height: 58 }, window),
    ).toEqual({
      x: 100,
      y: 642,
      width: 58,
      height: 58,
    });
    expect(
      clampInside({ x: -20, y: -5, width: 58, height: 58 }, window),
    ).toEqual({
      x: 0,
      y: 0,
      width: 58,
      height: 58,
    });
    // an icon that is inside is where it is
    const inside = { x: 40, y: 200, width: 58, height: 58 };
    expect(clampInside(inside, window)).toEqual(inside);
  });

  it('cuts with inset() in px with two decimals at most', () => {
    expect(
      inset(
        { x: 1.234, y: 2.5, width: 10, height: 10 },
        { width: 20, height: 20 },
        [1, 2, 3, 4],
      ),
    ).toBe('inset(2.5px 8.77px 7.5px 1.23px round 1px 2px 3px 4px)');
  });

  it('turns the icon into the app in the first third, and the app into the icon in the last third', () => {
    expect(CROSS).toBeCloseTo(1 / 3, 6);
    expect(crossOpacity('open')).toEqual([
      { opacity: 0, offset: 0 },
      { opacity: 1, offset: CROSS },
      { opacity: 1, offset: 1 },
    ]);
    expect(crossOpacity('close')).toEqual([
      { opacity: 1, offset: 0 },
      { opacity: 1, offset: 1 - CROSS },
      { opacity: 0, offset: 1 },
    ]);
  });

  it('lets the home screen recede a little and dim', () => {
    expect(RECEDE.scale).toBeGreaterThan(0.85);
    expect(RECEDE.scale).toBeLessThan(1);
    expect(RECEDE.opacity).toBeGreaterThan(0.4);
    expect(RECEDE.opacity).toBeLessThan(1);
  });
});
