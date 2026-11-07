/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useLayoutEffect, useState, type RefObject } from 'react';
import type { Size } from '@/skins/travel/map/camera';

/** The size of an element, kept up to date (the map needs it to centre and clamp its camera). */
export function useSize(ref: RefObject<HTMLElement | null>): {
  size: Size;
  ready: boolean;
} {
  const [size, setSize] = useState<Size>({ w: 1200, h: 700 });
  const [ready, setReady] = useState(false);
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const read = () => {
      const rect = element.getBoundingClientRect();
      setSize((old) =>
        Math.abs(old.w - rect.width) < 1 && Math.abs(old.h - rect.height) < 1
          ? old
          : { w: rect.width, h: rect.height },
      );
    };
    read();
    setReady(true);
    const observer = new ResizeObserver(read);
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return { size, ready };
}
