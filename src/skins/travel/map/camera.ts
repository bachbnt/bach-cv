/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { WORLD } from '@/skins/travel/map/iso';

/** What the visitor looks at: the world point in the middle of the view, and the zoom (1 = one pixel for each unit). */
export interface Camera {
  cx: number;
  cy: number;
  z: number;
}
export interface Size {
  w: number;
  h: number;
}

export const MAX_ZOOM = 2.4;

/** The smallest zoom still fills the view with the map (no empty sky around the slab). */
export const minZoom = (size: Size): number =>
  Math.max(size.w / WORLD.width, size.h / WORLD.height, 0.05);

/** Within this factor of the smallest zoom the whole map is on screen at once and its details are too small to see. */
const WHOLE_FACTOR = 1.6;

/** True when the camera is so far out that the whole map shows (`.tl-whole`): the map then stops what moves on it and drops the waves. */
export const showsWholeMap = (z: number, size: Size): boolean =>
  z <= minZoom(size) * WHOLE_FACTOR;

/** Keeps the camera inside the world and its zoom inside the limits. */
export function clampCamera(camera: Camera, size: Size): Camera {
  const z = Math.min(MAX_ZOOM, Math.max(minZoom(size), camera.z));
  const halfW = size.w / 2 / z;
  const halfH = size.h / 2 / z;
  const fit = (value: number, half: number, total: number) =>
    half * 2 >= total
      ? total / 2
      : Math.min(total - half, Math.max(half, value));
  return {
    z,
    cx: fit(camera.cx, halfW, WORLD.width),
    cy: fit(camera.cy, halfH, WORLD.height),
  };
}

/** Zooms by `factor` keeping the world point under the screen point (`px`, `py`) where it is. */
export function zoomAt(
  camera: Camera,
  size: Size,
  factor: number,
  px: number,
  py: number,
): Camera {
  const z = Math.min(MAX_ZOOM, Math.max(minZoom(size), camera.z * factor));
  // world point under the pointer before the zoom
  const wx = camera.cx + (px - size.w / 2) / camera.z;
  const wy = camera.cy + (py - size.h / 2) / camera.z;
  return clampCamera(
    { z, cx: wx - (px - size.w / 2) / z, cy: wy - (py - size.h / 2) / z },
    size,
  );
}

/** The camera that shows the box `from`...`to` (world pixels) with a margin. */
export function fitBox(
  from: { x: number; y: number },
  to: { x: number; y: number },
  size: Size,
  margin = 1.25,
): Camera {
  const w = Math.abs(to.x - from.x) * margin || 1;
  const h = Math.abs(to.y - from.y) * margin || 1;
  return clampCamera(
    {
      cx: (from.x + to.x) / 2,
      cy: (from.y + to.y) / 2,
      z: Math.min(size.w / w, size.h / h),
    },
    size,
  );
}

/** The CSS transform of the world box for a camera. */
export const cameraTransform = (camera: Camera, size: Size): string =>
  `translate3d(${size.w / 2 - camera.cx * camera.z}px, ${size.h / 2 - camera.cy * camera.z}px, 0) scale(${camera.z})`;

/** How big a sprite is drawn: it grows more slowly than the map, so labels stay readable far out and drawings do not bloat close up. */
export const spriteScale = (z: number): number => z ** -0.55;
