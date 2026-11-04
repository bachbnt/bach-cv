/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useEffect } from 'react';

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
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const seen = new WeakSet<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -5% 0px' },
    );

    const scan = () => {
      document.querySelectorAll<HTMLElement>(SELECTOR).forEach((el) => {
        if (seen.has(el) || el.closest('.hi')) return;
        seen.add(el);
        const parent = el.parentElement;
        const index = parent
          ? Array.prototype.indexOf.call(parent.children, el)
          : 0;
        el.setAttribute('data-reveal', '');
        el.style.setProperty('--d', `${Math.min((index % 6) * 70, 350)}ms`);
        io.observe(el);
      });
    };

    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      mo.disconnect();
      io.disconnect();
    };
  }, []);

  return null;
}
