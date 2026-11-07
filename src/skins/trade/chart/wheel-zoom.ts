/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/** A notch of a mouse wheel is about 100 px; a flick or a free-spinning wheel sends far more, which must never be a jump. */
export const WHEEL_MAX_DELTA = 120;
/** The zoom (as a logarithm) for each pixel of wheel: a notch of about 100 px is a change of about 15 percent. */
export const WHEEL_ZOOM_PER_PX = 0.0014;
/** A trackpad pinch arrives as a wheel with the Ctrl key down and small deltas, so each pixel counts more. */
export const PINCH_ZOOM_PER_PX = 0.006;
/** How long the window takes to cover most of the way to where the wheel asked it to go. */
export const WHEEL_SMOOTH_MS = 80;
/** The most zoom (as a logarithm) the wheel may have queued up: a very fast spin cannot run away. */
export const MAX_PENDING_ZOOM = 0.7;
/** What is left to apply when it is this small is dropped: the window has arrived. */
export const ZOOM_SETTLED = 0.0015;
export const PAN_SETTLED = 0.02;

/** The pixels of a wheel event: lines and pages become pixels, and one event is never more than `WHEEL_MAX_DELTA`. */
export function wheelPixels(delta: number, deltaMode: number): number {
  const unit = deltaMode === 1 ? 16 : deltaMode === 2 ? 400 : 1;
  return Math.max(-WHEEL_MAX_DELTA, Math.min(WHEEL_MAX_DELTA, delta * unit));
}

/** The zoom a wheel event asks for, as a logarithm of the factor (positive zooms out, as `deltaY` does). */
export function wheelZoomLog(pixels: number, pinch: boolean): number {
  return pixels * (pinch ? PINCH_ZOOM_PER_PX : WHEEL_ZOOM_PER_PX);
}

/** What is queued after one more event: added, and kept within `MAX_PENDING_ZOOM`. */
export function queueZoom(pending: number, asked: number): number {
  return Math.max(
    -MAX_PENDING_ZOOM,
    Math.min(MAX_PENDING_ZOOM, pending + asked),
  );
}

/**
 * How much of what is queued to apply in this frame: an exponential approach, so the window eases to where the wheel asked it to go
 * and the speed does not depend on the frame rate. With reduced motion all of it is applied at once (still once per frame).
 */
export function takeStep(
  pending: number,
  frameMs: number,
  reduced: boolean,
): number {
  if (reduced) return pending;
  const ease = 1 - Math.exp(-Math.min(frameMs, 64) / WHEEL_SMOOTH_MS);
  return pending * ease;
}
