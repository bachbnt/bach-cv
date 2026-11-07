/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useEffect, useState, type FocusEvent, type PointerEvent } from 'react';
import {
  canPreview,
  nextFrame,
  PREVIEW_MS,
} from '@/skins/stream/blocks/career-preview';
import { useReducedMotion } from '@/skins/stream/blocks/career-use-reduced-motion';

/**
 * The hover preview of a thumbnail: while a mouse rests on it, or the keyboard has the focus on it, `frame` is the screenshot to show
 * (the next one every `PREVIEW_MS`), and `null` is the cover. Nothing is asked for before the first hover, a finger or "reduce motion"
 * never starts it, and the timer stops on leave, blur and unmount.
 */
export function useCareerPreview(images: readonly string[]) {
  const reducedMotion = useReducedMotion();
  const [frame, setFrame] = useState<number | null>(null);
  const count = images.length;
  const playing = frame !== null;

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(
      () => setFrame((f) => nextFrame(f ?? 0, count)),
      PREVIEW_MS,
    );
    return () => clearInterval(id);
  }, [playing, count]);

  const start = (mouse: boolean) => {
    if (canPreview({ images, mouse, reducedMotion })) setFrame(0);
  };
  const stop = () => setFrame(null);

  return {
    frame,
    /** for the thumbnail */
    pointer: {
      onPointerEnter: (e: PointerEvent) => start(e.pointerType === 'mouse'),
      onPointerLeave: stop,
    },
    /** for the link that has the keyboard focus */
    focus: {
      onFocus: (e: FocusEvent) => {
        if (e.currentTarget.matches(':focus-visible')) start(true);
      },
      onBlur: stop,
    },
  };
}
