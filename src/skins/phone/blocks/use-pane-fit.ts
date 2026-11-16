/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useEffect, useState, type RefObject } from 'react';
import { usePhScreen } from '@/skins/phone/shell/screen-context';

/**
 * Cuts the card beside the list to what the screen shows of its scroller: from where the card is now (in the flow under the title while the
 * page is at its top, docked under the bars once it has scrolled up to them) to the foot of the scroller, less the home bar and a gap of `1rem`.
 * It is the card's `max-height` (rounded to the px, so a render is made only when it changes; the project inside is the same element and is
 * not drawn again). A window unit would be the height of the window, which a device is not.
 */
export function usePaneFit(
  card: RefObject<HTMLElement | null>,
): string | undefined {
  const { scroller } = usePhScreen();
  const [maxHeight, setMaxHeight] = useState<string>();
  useEffect(() => {
    const element = card.current;
    const grid = element?.parentElement;
    if (!element || !grid || !scroller) return;
    const fit = () => {
      const frame = scroller.getBoundingClientRect();
      // a device in a small window is scaled: the rects are in scaled px, `clientHeight` and the CSS are not
      const scale = frame.height / scroller.clientHeight || 1;
      const inFlow = (grid.getBoundingClientRect().top - frame.top) / scale;
      const docked = parseFloat(getComputedStyle(element).top) || 0;
      const top = Math.max(inFlow, docked);
      setMaxHeight(
        `calc(${Math.round(scroller.clientHeight - top)}px - var(--ph-home-bar, calc(2.25rem + env(safe-area-inset-bottom, 0px))) - 1rem)`,
      );
    };
    fit();
    scroller.addEventListener('scroll', fit, { passive: true });
    const observer = new ResizeObserver(fit);
    observer.observe(scroller);
    observer.observe(grid);
    // the app bar slides away after a scroll has been seen, and with it the line the card docks at
    const bar = new MutationObserver(fit);
    const screen = element.closest('[data-ph-screen]');
    if (screen) bar.observe(screen, { attributeFilter: ['data-bar'] });
    return () => {
      scroller.removeEventListener('scroll', fit);
      observer.disconnect();
      bar.disconnect();
    };
  }, [card, scroller]);
  return maxHeight;
}
