/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/**
 * The pings of the wheel, clockwise from the top. Each one does something real on the site: an alert only marks the spot, "on my way"
 * walks there, "need help" opens the BB Bot chat and "retreat" recalls to the fountain.
 */
export const PINGS = ['alert', 'onMyWay', 'retreat', 'assist'] as const;
export type PingKind = (typeof PINGS)[number];

/** The pointer inside this radius (in pixels) is on the middle of the wheel, which is no slice. */
export const DEAD_ZONE = 22;
/** Distance from the middle to the centre of a slice, in pixels. */
export const WHEEL_RADIUS = 76;

/** The slice under a pointer that is `dx`, `dy` pixels from the middle of the wheel, or `null` on the middle. */
export function sliceAt(dx: number, dy: number, count: number): number | null {
  if (Math.hypot(dx, dy) < DEAD_ZONE) return null;
  // 0 is the top, going clockwise; each slice is centred on its direction, so it reaches half a slice either way
  const turns = (Math.atan2(dx, -dy) + 2 * Math.PI) % (2 * Math.PI);
  return Math.round((turns / (2 * Math.PI)) * count) % count;
}

/** The centre of slice `index`, in pixels from the middle of the wheel. */
export function slicePoint(
  index: number,
  count: number,
  radius: number = WHEEL_RADIUS,
): { x: number; y: number } {
  const angle = (index / count) * 2 * Math.PI;
  return { x: Math.sin(angle) * radius, y: -Math.cos(angle) * radius };
}

/** How many markers stay on the map at once: the oldest one goes when a new ping would make more. */
export const MAX_PINGS = 6;
/** How long a marker stays, in milliseconds. */
export const PING_MS = 3200;
