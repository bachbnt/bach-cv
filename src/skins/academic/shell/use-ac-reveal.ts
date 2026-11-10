/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useLayoutEffect, type RefObject } from 'react';

/**
 * What arrives on a page of the board: a sheet of paper or a photo taped to the board is pinned on (`paper`) and a heading in chalk is
 * underlined (`line`). What is inside another sheet comes with it.
 */
const SHEET = '.ac-paper, .ac-wind';
const TARGETS = [
  { selector: SHEET, kind: 'paper' },
  { selector: '.ac-line', kind: 'line' },
] as const;

/**
 * Marks the sheets and the chalk headings of the page with `data-reveal` and, once one is in view, with `data-in` (empty: it plays its entrance; `still`: the eraser is wiping, so it does not) (`css/reveal.css` does the
 * rest). A sheet is marked before the first paint, so it never shows for a frame before it arrives; what comes after the mount (the content is
 * read from Firestore) is picked up as it appears. `page` is the page on show: the wrapper is a new element for each page.
 */
export function useAcReveal(root: RefObject<HTMLElement | null>, page: string) {
  useLayoutEffect(() => {
    const box = root.current;
    if (!box || typeof IntersectionObserver === 'undefined') return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          // a page that the eraser is uncovering is already arriving: its sheets are shown as they are (`still`), or the eraser would
          // uncover them half way through their own entrance, pale, tilted and without their tape
          entry.target.setAttribute(
            'data-in',
            document.documentElement.hasAttribute('data-ac-wipe')
              ? 'still'
              : '',
          );
          io.unobserve(entry.target);
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -4% 0px' },
    );

    const seen = new WeakSet<Element>();
    const scan = () => {
      for (const { selector, kind } of TARGETS) {
        box.querySelectorAll<HTMLElement>(selector).forEach((el) => {
          if (seen.has(el) || el.closest('.ac-ghost')) return;
          seen.add(el);
          if (kind === 'paper') {
            const holder = el.parentElement?.closest(SHEET);
            if (holder && box.contains(holder)) return;
          }
          el.setAttribute('data-reveal', kind);
          // the sheets of one row or one list arrive one after another
          const group = [...(el.parentElement?.children ?? [])].filter(
            (child) => child.getAttribute('data-reveal') === kind,
          );
          if (group.length > 1) {
            el.style.setProperty('--i', String(group.indexOf(el) % 6));
          }
          io.observe(el);
        });
      }
    };

    scan();
    const mo = new MutationObserver(scan);
    mo.observe(box, { childList: true, subtree: true });
    return () => {
      mo.disconnect();
      io.disconnect();
    };
  }, [root, page]);
}
