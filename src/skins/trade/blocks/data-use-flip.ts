/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useLayoutEffect, useRef, type RefObject } from 'react';

const EASING = 'cubic-bezier(0.2, 0.7, 0.2, 1)';

type Spots = Map<string, { x: number; y: number }>;

const spotsOf = (root: HTMLElement): Spots => {
  const origin = root.getBoundingClientRect();
  return new Map(
    [...root.querySelectorAll<HTMLElement>('[data-flip]')].map((el) => {
      const box = el.getBoundingClientRect();
      return [
        el.dataset.flip ?? '',
        { x: box.left - origin.left, y: box.top - origin.top },
      ];
    }),
  );
};

/**
 * FLIP for a list that is sorted or filtered: call the returned `capture` just before the state change; after the next render every
 * child with `data-flip="<id>"` that moved slides from where it was (a transform, so only the compositor works); a new child
 * brings its own entrance (a CSS animation). It animates through the Web Animations API, which the CSS rule for reduced motion cannot stop, so `enabled` is
 * `false` for that visitor.
 */
export function useFlip(
  container: RefObject<HTMLElement | null>,
  enabled: boolean,
): () => void {
  const before = useRef<Spots | null>(null);

  const capture = () => {
    const root = container.current;
    before.current = enabled && root ? spotsOf(root) : null;
  };

  useLayoutEffect(() => {
    const from = before.current;
    before.current = null;
    const root = container.current;
    if (!from || !root) return;
    const origin = root.getBoundingClientRect();
    for (const el of root.querySelectorAll<HTMLElement>('[data-flip]')) {
      const was = from.get(el.dataset.flip ?? '');
      if (!was) continue;
      const box = el.getBoundingClientRect();
      const dx = was.x - (box.left - origin.left);
      const dy = was.y - (box.top - origin.top);
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) continue;
      el.animate(
        [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }],
        { duration: 280, easing: EASING },
      );
    }
  });

  return capture;
}
