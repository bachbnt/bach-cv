/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useEffect } from 'react';

/**
 * Tells the `glow` cards where the mouse is: writes the pointer position, relative to the card under it, into the card's
 * --mx and --my. One listener for the whole page, so cards that arrive later (they are read from Firestore) work too.
 * Nothing runs without a mouse; the CSS is also off for prefers-reduced-motion.
 */
export function PointerGlow() {
  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches)
      return;

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      const card = (event.target as Element | null)?.closest<HTMLElement>(
        '.glow',
      );
      if (!card) return;
      const box = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${event.clientX - box.left}px`);
      card.style.setProperty('--my', `${event.clientY - box.top}px`);
    };

    document.addEventListener('pointermove', onMove, { passive: true });
    return () => document.removeEventListener('pointermove', onMove);
  }, []);

  return null;
}
