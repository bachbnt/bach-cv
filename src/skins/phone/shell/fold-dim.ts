/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/*
 * The screen of the device is never black while it folds or unfolds: a dark glass lies over it (`.ph-screen-dim`, `css/device.css`) and its opacity makes ONE
 * continuous curve across the whole motion, like the screens of a dual-screen phone that a sensor switches as the angle opens. These are the numbers of that
 * curve, in one place so that the CSS keyframes and the tests agree (`phone-fold-dim.test.ts` reads the CSS and checks it against this file).
 *
 * UNFOLD: the cover screen dims over the slide (180 ms), stays dim while the half swings up to the vertical, and the inner screen lights up as the angle
 * opens from 90 degrees until the half lands. FOLD: the inner screen dims as the angle closes from 180 degrees, stays dim through the vertical, and the cover screen
 * lights up over the slide back. The layout is swapped (a view transition) while the screen is at its dimmest, a little before the vertical when unfolding
 * and a little after when folding.
 */

/** the opacity of the glass at its dimmest: the screen is at 12% of its light, never black */
export const DIM_MAX = 0.88;
/** the length of the slide and of the swing, in ms (`--ph-slide-ms`, `--ph-swing-ms`) */
export const SLIDE_MS = 180;
export const SWING_MS = 380;
/** how much of the swing the half that swings back plays (the clock ends it; the slide back follows) */
export const FOLD_SWING_MS = 310;

/** a CSS cubic-bezier: its two control points */
export type Bezier = readonly [number, number, number, number];
/** the curve of the swing (`--ph-ease-fold`) */
export const EASE_FOLD: Bezier = [0.4, 0, 0.2, 1];
/** the curve of the dimming (in and out, soft: the glass never changes by more than a fifth of its range in 5% of the motion) */
export const EASE_DIM: Bezier = [0.3, 0.1, 0.7, 0.9];
/** the curve of the light coming up as the angle opens: it eases out */
export const EASE_LIGHT: Bezier = [0.3, 0.3, 0.4, 1];

/** The value of a CSS cubic-bezier timing function at `x` (0 to 1 of the time), found by bisection. */
export function bezier([x1, y1, x2, y2]: Bezier, x: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const point = (a: number, b: number, t: number) =>
    3 * (1 - t) ** 2 * t * a + 3 * (1 - t) * t * t * b + t ** 3;
  let low = 0;
  let high = 1;
  for (let i = 0; i < 40; i++) {
    const middle = (low + high) / 2;
    if (point(x1, x2, middle) < x) low = middle;
    else high = middle;
  }
  return point(y1, y2, (low + high) / 2);
}

/** The angle of the swinging half at `x` (0 to 1) of its swing, in degrees: 0 closed and 180 flat, whichever way it goes (the angle of an unfold at `x` is the angle of a fold at `1 - ` that of its curve). */
export const swingAngle = (x: number): number => 180 * bezier(EASE_FOLD, x);

/** The fraction of the swing at which the half is at the vertical (90 degrees), by bisection: the light of the inner screen starts to come up there. */
export function verticalAt(): number {
  let low = 0;
  let high = 1;
  for (let i = 0; i < 40; i++) {
    const middle = (low + high) / 2;
    if (swingAngle(middle) < 90) low = middle;
    else high = middle;
  }
  return (low + high) / 2;
}

/** The fractions of the swing, as the keyframes of the CSS have them (`ph-fold-dim-up`: 35%; `ph-fold-dim-close`: 42%), rounded to a percent. */
export const LIGHT_FROM = 0.35;
export const DIM_DONE = 0.42;

export type FoldDirection = 'unfold' | 'fold';

/** How long a whole motion is, in ms: an unfold is the slide and the swing, a fold the swing back and the slide. */
export const motionMs = (direction: FoldDirection): number =>
  direction === 'unfold' ? SLIDE_MS + SWING_MS : FOLD_SWING_MS + SLIDE_MS;

/**
 * The opacity of the dark glass over the screen at `progress` (0 to 1) of the whole motion. It is 0 at the start and at the end, DIM_MAX in the middle, and
 * continuous between: the same piecewise curve as the keyframes of `css/device.css`.
 */
export function dimAt(progress: number, direction: FoldDirection): number {
  const time = Math.min(1, Math.max(0, progress)) * motionMs(direction);
  if (direction === 'unfold') {
    // the cover screen dims over the slide
    if (time < SLIDE_MS) return DIM_MAX * bezier(EASE_DIM, time / SLIDE_MS);
    const x = (time - SLIDE_MS) / SWING_MS;
    // dim while the half rises to the vertical, then the inner screen lights up as the angle opens until the half has landed
    if (x <= LIGHT_FROM) return DIM_MAX;
    return (
      DIM_MAX * (1 - bezier(EASE_LIGHT, (x - LIGHT_FROM) / (1 - LIGHT_FROM)))
    );
  }
  // the inner screen dims as the angle closes, and stays dim through the vertical and the end of the swing back
  if (time < FOLD_SWING_MS) {
    const x = time / SWING_MS;
    if (x >= DIM_DONE) return DIM_MAX;
    return DIM_MAX * bezier(EASE_DIM, x / DIM_DONE);
  }
  // the cover screen lights up over the slide back
  return DIM_MAX * (1 - bezier(EASE_DIM, (time - FOLD_SWING_MS) / SLIDE_MS));
}
