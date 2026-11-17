/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

/**
 * One of the hardware keys on the right edge of the device, as a button: the look is the metal key (`css/device.css`), the name is for readers and for the
 * short tooltip (`ph-tip`, which here opens to the left, over the screen), and the hit area is 44 px or more tall (an invisible `::before`). A press sinks
 * the key into the frame for 100 ms. The behaviour is the caller's: this is only the key.
 */
export function PhDeviceKey({
  name,
  className,
  ...handlers
}: {
  name: string;
  className: string;
} & Omit<ComponentProps<'button'>, 'className' | 'children' | 'name'>) {
  return (
    <button
      type='button'
      aria-label={name}
      data-ph-tip={name}
      className={cn('ph-key ph-tip ph-tip-left', className)}
      {...handlers}
    />
  );
}
