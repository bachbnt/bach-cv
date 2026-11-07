/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useMediaQuery } from '@/skins/stream/shell/use-media-query';

/** Whether the visitor asked for less motion. The first render says no, and the answer arrives with the first effect. */
export const useReducedMotion = (): boolean =>
  useMediaQuery('(prefers-reduced-motion: reduce)');
