/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useMediaQuery } from '@/hooks/use-media-query';

/** The media query of a visitor who asked the system for less motion. */
export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Whether the visitor asked for less motion, kept up to date while the page is open. What CSS cannot stop (a timer, the camera of a map,
 * a count-up) checks it; the first render assumes motion is fine, as the static HTML does.
 */
export const useReducedMotion = (): boolean =>
  useMediaQuery(REDUCED_MOTION_QUERY, false);

/** The same answer read once, for an event handler or an effect that cannot call a hook (a scroll that is smooth or instant). */
export const prefersReducedMotion = (): boolean =>
  window.matchMedia(REDUCED_MOTION_QUERY).matches;
