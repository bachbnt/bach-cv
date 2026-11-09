/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import {
  hazeMask,
  maskOrigin,
  newBoardMask,
  oldBoardMask,
  WIPE,
  wipeFrame,
  wipeGeometry,
} from '@/skins/academic/shell/wipe-geometry';

const SIZES = [
  [1280, 860],
  [1920, 1080],
  [390, 800],
] as const;

describe('the arc of the eraser', () => {
  it('turns on a pivot below the board and goes from the left to the right', () => {
    for (const [w, h] of SIZES) {
      const g = wipeGeometry(w, h);
      expect(g.cy).toBeGreaterThan(h);
      expect(g.cx).toBe(w / 2);
      expect(g.sweepDeg).toBeGreaterThan(60);
      expect(g.sweepDeg).toBeLessThanOrEqual(180);
      const start = wipeFrame(g, 0).eraser;
      const end = wipeFrame(g, 1).eraser;
      // it comes from the left half of the board and leaves in the right half
      expect(start.x + g.eraserW / 2).toBeLessThan(w / 2);
      expect(end.x + g.eraserW / 2).toBeGreaterThan(w / 2);
    }
  });

  it('starts out of sight: left of the board, or under it', () => {
    for (const [w, h] of SIZES) {
      const g = wipeGeometry(w, h);
      const { x, y } = wipeFrame(g, 0).eraser;
      const inside =
        x >= 0 && x + g.eraserW <= w && y >= 0 && y + g.eraserH <= h;
      expect(inside).toBe(false);
    }
  });

  it('is a small eraser on a phone', () => {
    expect(wipeGeometry(390, 800).eraserW).toBeLessThan(
      wipeGeometry(1280, 860).eraserW,
    );
  });
});

describe('the frames of the wipe', () => {
  it('begin with the eraser off the page and no swath to speak of', () => {
    const g = wipeGeometry(1280, 860);
    const f = wipeFrame(g, 0);
    expect(f.radius).toBe(g.r0);
    expect(f.oldSectorDeg).toBe(0);
    expect(f.hazeOpacity).toBeCloseTo(0.5);
  });

  it('end with the old page gone from every corner, the new one shown, and no haze', () => {
    for (const [w, h] of SIZES) {
      const g = wipeGeometry(w, h);
      const f = wipeFrame(g, 1);
      expect(f.oldSectorDeg).toBe(360);
      expect(f.newSectorDeg).toBe(360);
      expect(f.hazeOpacity).toBe(0);
      expect(f.eraser.visible).toBe(false);
      // every corner is inside the ring even without its soft edge, for the old page and for the new one
      for (const [x, y] of [
        [0, 0],
        [w, 0],
        [0, h],
        [w, h],
      ]) {
        const distance = Math.hypot(x - g.cx, y - g.cy);
        expect(Math.abs(distance - g.rho)).toBeLessThan(
          f.newRadius - WIPE.soft,
        );
      }
    }
  });

  it('only grow: the swath, the turn and the eraser never go back', () => {
    const g = wipeGeometry(1280, 860);
    let before = wipeFrame(g, 0);
    for (let i = 1; i <= 100; i += 1) {
      const now = wipeFrame(g, i / 100);
      expect(now.radius).toBeGreaterThanOrEqual(before.radius);
      expect(now.oldSectorDeg).toBeGreaterThanOrEqual(before.oldSectorDeg);
      expect(now.newSectorDeg).toBeGreaterThanOrEqual(before.newSectorDeg);
      expect(now.hazeOpacity).toBeLessThanOrEqual(before.hazeOpacity);
      before = now;
    }
  });

  it('keeps the new page behind the eraser, never ahead of it', () => {
    const g = wipeGeometry(1280, 860);
    for (let i = 0; i <= 100; i += 1) {
      const f = wipeFrame(g, i / 100);
      expect(f.newSectorDeg).toBeLessThanOrEqual(f.oldSectorDeg + 1e-9);
    }
  });

  it('keeps a bare strip between the old page and the new one', () => {
    const g = wipeGeometry(1280, 860);
    for (let i = 0; i <= 100; i += 1) {
      const f = wipeFrame(g, i / 100);
      expect(f.radius - f.newRadius).toBeGreaterThanOrEqual(
        Math.min(g.gap, f.radius),
      );
      expect(g.gap).toBeGreaterThan(WIPE.soft);
    }
  });

  it('clamps progress outside 0 to 1', () => {
    const g = wipeGeometry(1280, 860);
    expect(wipeFrame(g, -3)).toEqual(wipeFrame(g, 0));
    expect(wipeFrame(g, 9)).toEqual(wipeFrame(g, 1));
  });
});

describe('the masks', () => {
  const g = wipeGeometry(1280, 860);
  const origin = maskOrigin(g, 100, 200);

  it('measure the pivot from the corner of the box that is masked', () => {
    expect(origin).toEqual({ x: g.cx - 100, y: g.cy - 200 });
  });

  it('are two gradient layers for each board: a ring and a sector', () => {
    const f = wipeFrame(g, 0.6);
    for (const mask of [
      oldBoardMask(g, f, origin),
      newBoardMask(g, f, origin),
      hazeMask(g, f, origin),
    ]) {
      expect(mask.layers).toHaveLength(2);
      expect(mask.layers[0]).toMatch(/^radial-gradient\(circle at /);
      expect(mask.layers[1]).toMatch(/^conic-gradient\(from /);
    }
  });

  it('combine the old page by adding what is outside, the new one by intersecting what is inside', () => {
    const f = wipeFrame(g, 0.6);
    expect(oldBoardMask(g, f, origin).composite).toBe('add');
    expect(newBoardMask(g, f, origin).composite).toBe('intersect');
    expect(hazeMask(g, f, origin).composite).toBe('intersect');
  });

  it('hide the new page while the swath is too narrow to hold it', () => {
    const f = wipeFrame(g, 0);
    expect(newBoardMask(g, f, origin).layers).toEqual([
      'linear-gradient(transparent, transparent)',
    ]);
  });

  it('never write NaN or Infinity', () => {
    for (let i = 0; i <= 20; i += 1) {
      const f = wipeFrame(g, i / 20);
      for (const mask of [
        oldBoardMask(g, f, origin),
        newBoardMask(g, f, origin),
        hazeMask(g, f, origin),
      ]) {
        expect(mask.layers.join('')).not.toMatch(/NaN|Infinity/);
      }
    }
  });
});
