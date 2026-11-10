/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useEffect } from 'react';
import { prefersReducedMotion } from '@/hooks/use-reduced-motion';

/** Elements that fade up when they scroll into view (the selector list from the design mockup). */
const SELECTOR = [
  'main section h2',
  'main article',
  'main a[data-row]',
  'main [data-reveal-item]',
].join(',');

/**
 * Marks matching elements with `data-reveal` and adds `.in` when they enter the viewport, staggered by position.
 * Content arrives after mount (it is read from Firestore), so new elements are picked up as they appear.
 * Nothing runs for prefers-reduced-motion, and the CSS only hides elements that carry the attribute.
 */
export function RevealOnScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    const seen = new WeakSet<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          el.classList.add('in');
          io.unobserve(el);
          // the stagger delay is for the entrance only: once it has played, hover must answer at once
          window.setTimeout(() => el.style.setProperty('--d', '0ms'), 1200);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -5% 0px' },
    );

    let frame = 0;
    const scan = () => {
      frame = 0;
      document.querySelectorAll<HTMLElement>(SELECTOR).forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        // another skin (`data-skin-root`) reveals its own blocks, and the entrance blocks (`hi`) have their own animation
        if (el.closest('.hi, [data-skin-root]')) return;
        const parent = el.parentElement;
        const index = parent
          ? Array.prototype.indexOf.call(parent.children, el)
          : 0;
        el.setAttribute('data-reveal', '');
        el.style.setProperty('--d', `${Math.min((index % 6) * 70, 350)}ms`);
        io.observe(el);
      });
    };

    // one scan per frame, however many changes arrive (a streamed chat answer changes the page for every word)
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(scan);
    };

    scan();
    const mo = new MutationObserver(schedule);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      cancelAnimationFrame(frame);
      mo.disconnect();
      io.disconnect();
    };
  }, []);

  return null;
}
