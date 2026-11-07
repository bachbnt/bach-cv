/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ComponentProps, Ref } from 'react';
import { display } from '@/skins/moba/fonts';
import { cn } from '@/lib/utils';

/**
 * The root of a Moba window (the arena, the maintenance screen): the colours and the base type of the skin, filling the browser window.
 * `mb-root` is the scope of the rules in `moba.css` and `css/*`.
 */
export function MbRoot({
  className,
  ref,
  ...props
}: ComponentProps<'div'> & { ref?: Ref<HTMLDivElement> }) {
  return (
    <div
      ref={ref}
      data-skin-root='moba'
      className={cn(
        'mb-root fixed inset-0 overflow-hidden bg-mb-void font-sans text-[15px]/[1.5] text-mb-ink antialiased',
        display.variable,
        className,
      )}
      {...props}
    />
  );
}
