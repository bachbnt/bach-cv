/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useEffect, type RefObject } from 'react';

/** Blocks marked `data-reveal` fade up when they scroll into view: this adds `data-in` to them (the CSS does the rest). */
export function useDevReveal(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const box = root.current;
    if (!box) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute('data-in', '');
          io.unobserve(entry.target);
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -4% 0px' },
    );

    // what this run has already looked at (a marker on the element would survive a remount, and the new observer would skip it)
    const seen = new WeakSet<Element>();
    const scan = () => {
      box
        .querySelectorAll<HTMLElement>('[data-reveal]:not([data-in])')
        .forEach((el) => {
          if (seen.has(el)) return;
          seen.add(el);
          if (!el.style.getPropertyValue('--i')) {
            const group = [...(el.parentElement?.children ?? [])].filter((c) =>
              c.hasAttribute('data-reveal'),
            );
            if (group.length > 1) {
              el.style.setProperty('--i', String(group.indexOf(el) % 6));
            }
          }
          io.observe(el);
        });
    };

    scan();
    const mo = new MutationObserver(scan);
    mo.observe(box, { childList: true, subtree: true });
    return () => {
      mo.disconnect();
      io.disconnect();
    };
  }, [root]);
}
