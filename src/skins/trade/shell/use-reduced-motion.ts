/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { useMediaQuery } from '@/hooks/use-media-query';

/** Whether the visitor asked for less motion. The script of the skin that moves things (the market tick) checks it, because CSS cannot stop a timer. */
export const useReducedMotion = () =>
  useMediaQuery('(prefers-reduced-motion: reduce)', false);
