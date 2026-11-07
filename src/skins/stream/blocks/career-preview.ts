/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/** How long each screenshot of a project stays in the hover preview, in milliseconds. */
export const PREVIEW_MS = 900;

/** The screenshot that follows `frame`, going round: after the last one comes the first. */
export function nextFrame(frame: number, count: number): number {
  return count <= 0 ? 0 : (frame + 1) % count;
}

/** A preview needs a screenshot to show, a mouse (never a finger), and a visitor who has not asked for less motion. */
export function canPreview(opts: {
  images: readonly string[];
  mouse: boolean;
  reducedMotion: boolean;
}): boolean {
  return opts.images.length > 0 && opts.mouse && !opts.reducedMotion;
}
