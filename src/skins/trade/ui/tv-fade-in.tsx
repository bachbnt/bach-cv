/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { useReducedMotion } from '@/skins/trade/shell/use-reduced-motion';

/** The curve of the skin's own arrivals (`--ease-tv-out`): a script cannot read the variable. */
const EASING = 'cubic-bezier(0.2, 0.7, 0.2, 1)';
const DURATION_MS = 240;

/**
 * Content that arrives where a skeleton was: the blocks fade in instead of snapping over the shimmer. The wrapper has no box
 * (`display: contents`), so the layout is the one the content has without it; the fade is an opacity animation of its children, and a child
 * that already arrives with an animation of its own (a staggered rise) is left alone so the two do not fight.
 */
export function TvFadeIn({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  useLayoutEffect(() => {
    if (reduced) return;
    const animations = Array.from(root.current?.children ?? [])
      .filter((child) => child.getAnimations().length === 0)
      .map((child) =>
        child.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: DURATION_MS,
          easing: EASING,
        }),
      );
    return () => animations.forEach((animation) => animation.cancel());
  }, [reduced]);
  return (
    <div ref={root} className='contents'>
      {children}
    </div>
  );
}
