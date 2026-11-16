/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

/**
 * The root of the Phone skin (the frame and the maintenance screen): what is behind the device, the colours and the type. `ph-root` is the
 * scope of the rules in `phone.css`, which also give it the system type: the look is a phone's, which uses what the device has.
 */
export function PhRoot({
  className,
  children,
  ...props
}: ComponentProps<'div'>) {
  return (
    <div
      data-skin-root='phone'
      className={cn(
        'ph-root min-h-dvh bg-ph-backdrop text-[15px]/[1.5] text-ph-ink antialiased',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
