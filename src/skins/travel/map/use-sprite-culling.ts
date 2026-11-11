/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useEffect, type RefObject } from 'react';

/** What the world holds that moves by itself: a drawing (`.tl-sprite`) with its flag, steam or boat, and the cabins of the cable car. */
const MOVERS = '.tl-sprite, .tl-gondola';
/** How far past the edge of the map a drawing still plays its loops, as a share of the map, so that what is about to come into view already moves. */
const MARGIN = '40%';

/**
 * The loops of a drawing (a flag waving, steam, a boat bobbing, a wheel turning) are only for the ones near the screen: the world is far larger
 * than the screen and each loop is a layer of its own, and everything that lies over a layer is made a layer too. A phone has to build a hundred
 * of them to move the camera. So a drawing that is more than `MARGIN` away from the map is marked `data-off` and `still.css` stops its loops.
 * It starts again from its first frame when it comes back, which nobody can tell for scenery.
 */
export function useSpriteCulling(
  stage: RefObject<HTMLElement | null>,
  view: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    const root = stage.current;
    const world = view.current;
    if (!root || !world || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) entry.target.removeAttribute('data-off');
          else entry.target.setAttribute('data-off', '');
        }
      },
      { root, rootMargin: MARGIN },
    );
    const seen = new WeakSet<Element>();
    const watch = () => {
      world.querySelectorAll(MOVERS).forEach((element) => {
        if (seen.has(element)) return;
        seen.add(element);
        observer.observe(element);
      });
    };
    watch();
    // a drawing that arrives later (a language change draws the sights again) is watched too
    const arrivals = new MutationObserver(watch);
    arrivals.observe(world, { childList: true });
    return () => {
      arrivals.disconnect();
      observer.disconnect();
    };
  }, [stage, view]);
}
