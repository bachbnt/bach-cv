/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useLayoutEffect, type RefObject } from 'react';

/**
 * The elements that read `--tl-sc` (the size of the sprites): the last compound of every selector in `css/` that has `var(--tl-sc)` in a
 * declaration. `travel-css.test.ts` keeps the list and the CSS together, so a sprite that is added is never left at the size of `1`.
 */
export const SCALED = [
  '.tl-art',
  '.tl-hit',
  '.tl-name',
  '.tl-info-card',
  '.tl-pin-btn',
  '.tl-pin-flag',
  '.tl-traveller-in',
  '.tl-gondola-in',
  '.tl-boat > *',
] as const;
const ALL = SCALED.join(',');

/**
 * Gives `--tl-sc` to the sprites themselves, not to the world. The property is registered with `inherits: false` (`map.css`), so a new size
 * restyles the few hundred elements that read it instead of all of the 5,000 that would inherit it from the world: a zoom or the start of
 * the trip made one restyle of 145-170 ms at 6 times slower, now about 15 ms. A sprite that arrives later (a card, the pins, a new language)
 * takes the size in the microtask that follows its commit, before it is first drawn. Where `@property` is not known the property is inherited
 * as it always was, and the values set here are the same as the world's.
 */
export function useSpriteScale(
  view: RefObject<HTMLElement | null>,
  scale: number,
) {
  useLayoutEffect(() => {
    const world = view.current;
    if (!world) return;
    const value = String(scale);
    const give = (element: Element) => {
      const style = (element as HTMLElement).style;
      if (style.getPropertyValue('--tl-sc') !== value)
        style.setProperty('--tl-sc', value);
    };
    world.querySelectorAll(ALL).forEach(give);
    const arrivals = new MutationObserver((records) => {
      for (const { addedNodes } of records)
        addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          if (node.matches(ALL)) give(node);
          node.querySelectorAll(ALL).forEach(give);
        });
    });
    arrivals.observe(world, { childList: true, subtree: true });
    return () => arrivals.disconnect();
  }, [view, scale]);
}
