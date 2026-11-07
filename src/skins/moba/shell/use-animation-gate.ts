/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useEffect, type RefObject } from 'react';

/**
 * Pauses the moving parts of the map (the SMIL minion waves with `pauseAnimations`, and the CSS animations through `data-paused` on the
 * root) while the window is hidden, the map is off screen or the visitor asked for less motion, so the arena costs nothing then.
 */
export function useAnimationGate(
  root: RefObject<HTMLElement | null>,
  svg: RefObject<SVGSVGElement | null>,
  reduced: boolean,
): void {
  useEffect(() => {
    const rootEl = root.current;
    const svgEl = svg.current;
    if (!rootEl) return;
    let visible = true;
    const apply = () => {
      const paused = reduced || document.hidden || !visible;
      if (paused) rootEl.setAttribute('data-paused', '');
      else rootEl.removeAttribute('data-paused');
      if (svgEl) {
        if (paused) svgEl.pauseAnimations();
        else svgEl.unpauseAnimations();
      }
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      apply();
    });
    observer.observe(rootEl);
    document.addEventListener('visibilitychange', apply);
    apply();
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', apply);
    };
  }, [root, svg, reduced]);
}
