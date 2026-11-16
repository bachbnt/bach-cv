/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useEffect } from 'react';
import { scrollCue } from '@/skins/phone/shell/scroll-cue';

/**
 * A phone shows the scrollbar only while the page is scrolling. CSS cannot know that, so one passive listener, in the capture phase of the
 * document (a scroll does not bubble, but every scroller of the skin is in the document: the screen, the panes, the lists of a popover, the
 * viewer and the sheets in their layer), puts `data-scrolling` on whatever scrolled, `html` for the document, and takes it off 800 ms after
 * the last scroll (`phone.css` draws the thumb under it). It also lets go when the page is hidden or goes away.
 */
export function useScrollCue() {
  useEffect(() => {
    const cue = scrollCue<Element>(
      (element, on) =>
        on
          ? element.setAttribute('data-scrolling', '')
          : element.removeAttribute('data-scrolling'),
      (run, delay) => window.setTimeout(run, delay),
      (id) => window.clearTimeout(id),
    );
    const onScroll = (event: Event) => {
      const { target } = event;
      cue.note(target instanceof Element ? target : document.documentElement);
    };
    const onHide = () => {
      if (document.visibilityState === 'hidden') cue.stop();
    };
    document.addEventListener('scroll', onScroll, {
      capture: true,
      passive: true,
    });
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', cue.stop);
    return () => {
      document.removeEventListener('scroll', onScroll, { capture: true });
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('pagehide', cue.stop);
      cue.stop();
    };
  }, []);
}
