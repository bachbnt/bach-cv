/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/** Where the axis of the fish trap leaves its mouth, and the height of that axis above the stage floor. */
export const AXIS = { x: 62, y: 83, height: 31 } as const;

/** Screen point of a place of the scene: `u` goes away from the mouth (up and right), `s` along the mouth (down and right), `t` up from the axis. */
export function at(u: number, s: number, t: number) {
  return [AXIS.x + u + s, AXIS.y - 0.5 * u + 0.5 * s - t] as const;
}

/** A point on the stage floor (or, with `lift`, above it). */
export const floor = (u: number, s: number, lift = 0) =>
  at(u, s, lift - AXIS.height);
