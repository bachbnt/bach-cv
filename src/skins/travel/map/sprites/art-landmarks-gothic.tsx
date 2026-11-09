/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/** The outline of a pointed (Gothic) window or door whose foot is on (x, y); several can share one path. */
export function gothicPath(x: number, y: number, w: number, h: number) {
  const s = h - w * 0.9;
  return `M${x - w / 2} ${y}v${-s}Q${x - w / 2} ${y - h + w * 0.2} ${x} ${y - h}Q${x + w / 2} ${y - h + w * 0.2} ${x + w / 2} ${y - s}v${s}z`;
}
