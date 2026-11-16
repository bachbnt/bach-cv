/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ComponentProps } from 'react';
import type { PopoverContent } from '@/components/ui/popover';

/**
 * Where a popover under the buttons of the bar goes when the screen has little room: it stays under its button and shrinks to what is left
 * (`max-h-[min(34rem,var(--available-height))]`, which Base UI measures against the screen), and never hops to the side of the button, where
 * it would hide the buttons and the way back.
 */
export const POPOVER_AVOIDANCE: ComponentProps<
  typeof PopoverContent
>['collisionAvoidance'] = {
  side: 'none',
  align: 'shift',
  fallbackAxisSide: 'none',
};
