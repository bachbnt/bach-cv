/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { useMediaQuery } from '@/hooks/use-media-query';

/** Whether the screen is wide enough for the full terminal (side rails and watchlist beside the chart). */
export const useWide = () => useMediaQuery('(min-width: 1101px)', true);
