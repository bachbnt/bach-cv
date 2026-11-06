/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useEffect } from 'react';

/**
 * Tells the glowing parts of the page where the mouse is. One listener for the whole page, so parts that arrive later (cards are
 * read from Firestore) work too. Nothing runs without a mouse; the CSS is also off for prefers-reduced-motion.
 *
 * - A `glow` card gets the pointer position relative to itself in --mx / --my.
 * - Every `band-glow` (the tinted head of a page is two blocks, the header and the title) gets it relative to itself and a
 *   --band-o of 1 while the pointer is over any of them, 0 otherwise, so the light goes on across the join.
 */
export function PointerGlow() {
  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches)
      return;

    let frame = 0;
    let x = 0;
    let y = 0;

    const lightBands = (on: boolean) => {
      const bands = document.querySelectorAll<HTMLElement>('.band-glow');
      let inside = false;
      for (const band of bands) {
        const box = band.getBoundingClientRect();
        band.style.setProperty('--mx', `${x - box.left}px`);
        band.style.setProperty('--my', `${y - box.top}px`);
        if (x >= box.left && x <= box.right && y >= box.top && y <= box.bottom)
          inside = true;
      }
      for (const band of bands)
        band.style.setProperty('--band-o', on && inside ? '1' : '0');
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      x = event.clientX;
      y = event.clientY;

      const card = (event.target as Element | null)?.closest<HTMLElement>(
        '.glow',
      );
      if (card) {
        const box = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${x - box.left}px`);
        card.style.setProperty('--my', `${y - box.top}px`);
      }

      if (!frame)
        frame = requestAnimationFrame(() => {
          frame = 0;
          lightBands(true);
        });
    };
    const onLeave = () => lightBands(false);

    document.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      document.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
