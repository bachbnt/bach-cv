/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/*
 * The corner of a half on the side of the hinge is almost square but rounded (8 px for the slab, 4 px for its glass: the cover's). While the half swings it keeps that
 * corner as long as it lies over the other half, where a square one would look like a mistake, and goes to square as it comes down beside it, where a rounded one
 * would be a hook at the top and the bottom of the hinge. These are the numbers (the keyframes of `css/device.css` are checked against them).
 */

/** the radius of the hinge side of a slab, in px: the cover's */
export const HINGE_RADIUS = 8;
/** up to this angle (degrees open) the corner is the cover's, and from `HINGE_SQUARE_AT` on it is square */
export const HINGE_FULL_UNTIL = 50;
export const HINGE_SQUARE_AT = 100;

/** The radius of the hinge side at `angle` degrees open (0 closed over the other half, 180 flat beside it): full, then a straight ramp, then square. */
export const hingeRadius = (angle: number): number => {
  if (angle <= HINGE_FULL_UNTIL) return HINGE_RADIUS;
  if (angle >= HINGE_SQUARE_AT) return 0;
  return (
    (HINGE_RADIUS * (HINGE_SQUARE_AT - angle)) /
    (HINGE_SQUARE_AT - HINGE_FULL_UNTIL)
  );
};
