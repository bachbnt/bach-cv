/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

/** The root of a Travel screen (the map frame, the maintenance screen): the colours and the base type of the skin. `tl-root` scopes the rules of `travel.css`. */
export function TlRoot({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-skin-root='travel'
      className={cn(
        'tl-root bg-tl-sky-1 text-[14px]/[1.4] text-tl-ink antialiased',
        className,
      )}
      {...props}
    />
  );
}
