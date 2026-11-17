/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { bezier, EASE_FOLD } from '@/skins/phone/shell/fold-dim';

/*
 * The half that swings comes TOWARD the viewer, so its near edge is enlarged by the perspective, and in a window of normal height it would go beyond the top and the bottom
 * of the window and have its corners cut. Two things keep it inside: a long perspective, so that the near edge grows by about a tenth, and a pull-back, in which the
 * whole device (the stage) scales down about its middle as the half comes up and back to 1 as it lands or leaves. Both are measured here, not felt.
 */

/** the perspective distance of the swinging half, in px (`.ph-swing`), and how far its free edge is from the axis it turns about */
export const PERSPECTIVE = 6000;
export const FREE_EDGE = 570;
/** the pull-back at the vertical: the stage is 90% of its size there */
export const PULL = 0.1;
/** where the keyframes of `ph-fold-pull` are, as fractions of the swing (every twentieth) */
export const PULL_STOPS = Array.from({ length: 21 }, (_, index) => index / 20);

/** How much the near edge of the half is enlarged at `angle` degrees: the perspective's scale at the depth of the free edge. */
export const nearEdge = (angle: number): number =>
  PERSPECTIVE / (PERSPECTIVE - FREE_EDGE * Math.sin((angle * Math.PI) / 180));

/** The scale of the stage at the fraction `x` of the swing: 1 at both ends and the least at the vertical, as the sine of the angle (the same going either way). */
export const pullAt = (x: number): number =>
  1 - PULL * Math.sin(Math.PI * bezier(EASE_FOLD, x));

/** How tall the swinging half looks at `x` of its swing, as a part of the height of the device: the pull-back times the enlargement of its near edge. */
export const silhouetteAt = (x: number, angle: number): number =>
  pullAt(x) * nearEdge(angle);
