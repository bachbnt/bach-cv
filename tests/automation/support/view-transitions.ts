/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { Page } from '@playwright/test';

/** One animation of a view transition: `::view-transition-new(name)`, the keyframes it plays and how long it lasts. */
export interface TransitionAnimation {
  pseudo: string;
  keyframes: string;
  duration: number;
}

interface Tracker {
  started: number;
  animations: TransitionAnimation[];
}

declare global {
  interface Window {
    __vt?: Tracker;
  }
}

/**
 * Watches the view transitions the page starts (React starts one for a route change and for a filter inside `startTransition`):
 * how many, and, when each is ready, the animations that play on its pseudo-elements. Call it before `page.goto`. It proves the CSS
 * really matched (a selector that does not match leaves the browser's own fade, `-ua-view-transition-fade-in`).
 */
export async function trackViewTransitions(page: Page) {
  await page.addInitScript(() => {
    const tracker: Tracker = { started: 0, animations: [] };
    window.__vt = tracker;
    const original = document.startViewTransition?.bind(document);
    if (!original) return;
    document.startViewTransition = ((arg?: unknown) => {
      tracker.started += 1;
      const transition = original(arg as never);
      transition.ready
        .then(() => {
          for (const animation of document.getAnimations()) {
            const effect = animation.effect as KeyframeEffect | null;
            if (!effect?.pseudoElement?.startsWith('::view-transition'))
              continue;
            tracker.animations.push({
              pseudo: effect.pseudoElement,
              keyframes: (animation as CSSAnimation).animationName ?? '',
              duration: Number(effect.getComputedTiming().duration),
            });
          }
        })
        .catch(() => undefined);
      return transition;
    }) as typeof document.startViewTransition;
  });
  return {
    started: () => page.evaluate(() => window.__vt?.started ?? 0),
    animations: () => page.evaluate(() => window.__vt?.animations ?? []),
  };
}
