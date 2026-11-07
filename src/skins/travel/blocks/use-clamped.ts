/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useEffect, useState, type RefObject } from 'react';

/**
 * Whether a line-clamped text really loses lines. It measures while the text is clamped (`collapsed`), so the "Read more" button
 * shows only for a text that needs it, at any width and in either language (`text` changes with the language).
 */
export function useClamped(
  ref: RefObject<HTMLElement | null>,
  collapsed: boolean,
  text: string,
): boolean {
  const [clamped, setClamped] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !collapsed) return;
    const measure = () => setClamped(el.scrollHeight > el.clientHeight + 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, collapsed, text]);
  return clamped;
}
