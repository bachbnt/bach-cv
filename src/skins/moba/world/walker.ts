/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { WORLD, dist, type Pt } from '@/skins/moba/world/geometry';
import { slide } from '@/skins/moba/world/ground';
import { pathLength, pointAtDistance } from '@/skins/moba/world/nav';

/** Map units per second. */
export const SPEED = 520;
/** The last stretch of a walk slows down, so the champion settles on a station instead of stopping dead. */
const EASE_OUT = 90;
/** A walk starts at this share of the speed and reaches the full one over `RAMP` seconds. */
const RAMP = 0.16;

export type Direction = 'up' | 'down' | 'left' | 'right';

const VECTORS: Record<Direction, Pt> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

export interface Step {
  pos: Pt;
  moving: boolean;
  /** a walk along a path has just ended */
  arrived: boolean;
}

/**
 * The champion's movement, with no browser in it: a walk along a path (a click on the map or the minimap) or steps by hand (the arrow
 * keys, which slide along the lanes). `tick` advances it by the time that passed.
 */
export class Walker {
  pos: Pt;
  private path: Pt[] | null = null;
  private walked = 0;
  private length = 0;
  private elapsed = 0;
  private readonly held = new Set<Direction>();

  constructor(start: Pt) {
    this.pos = start;
  }

  /** Puts the champion somewhere at once and ends any walk. */
  place(at: Pt): void {
    this.pos = at;
    this.stop();
  }

  walk(path: Pt[]): void {
    this.held.clear();
    if (path.length < 2) {
      this.path = null;
      return;
    }
    this.path = path;
    this.length = pathLength(path);
    this.walked = 0;
    this.elapsed = 0;
  }

  stop(): void {
    this.path = null;
    this.held.clear();
  }

  hold(direction: Direction, down: boolean): void {
    if (down) {
      // walking by hand ends a walk to a place
      this.path = null;
      this.held.add(direction);
    } else this.held.delete(direction);
  }

  get walking(): boolean {
    return this.path !== null;
  }

  get steering(): boolean {
    return this.held.size > 0;
  }

  /** The place a walk is going to. */
  get destination(): Pt | null {
    return this.path ? this.path[this.path.length - 1] : null;
  }

  tick(seconds: number): Step {
    if (this.path) {
      this.elapsed += seconds;
      const left = this.length - this.walked;
      const ramp = Math.min(1, 0.4 + 0.6 * (this.elapsed / RAMP));
      const ease = left < EASE_OUT ? Math.max(0.3, left / EASE_OUT) : 1;
      this.walked = Math.min(
        this.length,
        this.walked + SPEED * ramp * ease * seconds,
      );
      this.pos = pointAtDistance(this.path, this.walked);
      if (this.walked >= this.length) {
        this.path = null;
        return { pos: this.pos, moving: false, arrived: true };
      }
      return { pos: this.pos, moving: true, arrived: false };
    }
    if (this.held.size > 0) {
      let x = 0;
      let y = 0;
      for (const direction of this.held) {
        x += VECTORS[direction].x;
        y += VECTORS[direction].y;
      }
      const length = Math.hypot(x, y);
      if (length > 0) {
        const step = SPEED * 0.8 * seconds;
        const next = slide(this.pos, {
          x: (x / length) * step,
          y: (y / length) * step,
        });
        const moved = dist(next, this.pos) > 0.01;
        this.pos = clampToWorld(next);
        return { pos: this.pos, moving: moved, arrived: false };
      }
    }
    return { pos: this.pos, moving: false, arrived: false };
  }
}

const clampToWorld = (p: Pt): Pt => ({
  x: Math.min(WORLD, Math.max(0, p.x)),
  y: Math.min(WORLD, Math.max(0, p.y)),
});
