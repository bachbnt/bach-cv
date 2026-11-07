/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useEffect, type ComponentProps } from 'react';
import { cn } from '@/lib/utils';
import { roboto } from '@/skins/stream/fonts';

/**
 * The root of a Stream screen (the frame, the maintenance screen): the page colours and the one font of the skin.
 * `sm-root` is the scope of the rules in `stream.css`; `group/sm` lets the parts of the shell follow its state.
 */
export function StreamRoot({ className, ...props }: ComponentProps<'div'>) {
  // the font variable goes on <html>, so the menus, sheets and dialogs that React puts in <body> use the same family
  useEffect(() => {
    const classes = roboto.variable.split(' ');
    document.documentElement.classList.add(...classes);
    return () => document.documentElement.classList.remove(...classes);
  }, []);

  return (
    <div
      data-skin-root='stream'
      className={cn(
        'sm-root group/sm min-h-screen bg-sm-bg font-sans text-sm/[1.4] text-sm-ink antialiased',
        className,
      )}
      {...props}
    />
  );
}
