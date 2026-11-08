/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { useMediaQuery } from '@/hooks/use-media-query';

/** Whether the main pointer is a finger: the chart's own buttons then get a bigger strip. */
export const useCoarse = () => useMediaQuery('(pointer: coarse)', false);
