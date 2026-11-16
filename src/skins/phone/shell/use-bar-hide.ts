/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useEffect } from 'react';
import { useChat } from '@/components/chat/chat-provider';
import { usePhOverlays } from '@/skins/phone/shell/overlay-context';
import { usePhScreen } from '@/skins/phone/shell/screen-context';
import {
  barFollow,
  barOpacity,
  barSettle,
  barStart,
  barTail,
} from '@/skins/phone/shell/bar-scroll';

/** How long the scrolling has been still before the bar settles, in ms. */
const SETTLE_MS = 120;

/**
 * Makes the app bar follow the scroll, as the bar of a real OS does: it slides up with the page going down and back with the page coming up,
 * driven by the scroll itself. One `requestAnimationFrame` per frame writes two CSS variables on the bar (`--ph-bar-y`, `--ph-bar-o`), which
 * its `transform` and `opacity` read: no render, no layout, no change of the blur or the border. When the scrolling stops the bar settles,
 * fully in place or fully out of sight (`data-snap` gives that one move a transition). The screen has `data-bar="hidden"` once the bar is
 * more than half away (`--ph-bar-shown` for the sticky panes). It looks at both places a page can scroll in, the scroller of the screen and the
 * window. The bar is in place while a sheet, the shade, the chat or the viewer is open, when something in it has the focus, and after a change of
 * page (the bar is made again).
 */
export function useBarHide(bar: HTMLElement | null) {
  const { scroller } = usePhScreen();
  const { settingsOpen, cvOpen, connectOpen, viewer } = usePhOverlays();
  const { isOpen: chatOpen } = useChat();
  const covered =
    settingsOpen || cvOpen || connectOpen || viewer !== null || chatOpen;
  useEffect(() => {
    const screen = bar?.closest<HTMLElement>('[data-ph-screen]');
    if (!bar || !screen) return;
    // the distance that takes the bar out of sight: its own height and the status bar it starts under
    const heightOf = () =>
      bar.offsetHeight + parseFloat(getComputedStyle(bar).top);
    const place = (y: number, height: number) => {
      bar.style.setProperty('--ph-bar-y', `${y}px`);
      bar.style.setProperty('--ph-bar-o', String(barOpacity(y, height)));
      bar.style.setProperty('--ph-bar-t', String(barTail(y, height)));
      const hidden = y <= -height / 2;
      if ((screen.dataset.bar === 'hidden') !== hidden)
        screen.dataset.bar = hidden ? 'hidden' : 'shown';
    };
    const read = () => (scroller?.scrollTop ?? 0) + window.scrollY;
    let state = barStart(read());
    // the way the page went last (up: the bar comes back), and whether a finger is down: the bar does not settle under a finger that is held still
    let up = false;
    let held = false;
    let frame = 0;
    let settle: ReturnType<typeof setTimeout> | undefined;
    let snapEnd: ReturnType<typeof setTimeout> | undefined;
    const snapTo = (y: number, height: number) => {
      bar.dataset.snap = '';
      place(y, height);
      state = { ...state, y };
      clearTimeout(snapEnd);
      snapEnd = setTimeout(() => delete bar.dataset.snap, 260);
    };
    const follow = () => {
      frame = 0;
      const height = heightOf();
      const before = state.top;
      state = barFollow(state, read(), height);
      if (state.top !== before) up = state.top < before;
      delete bar.dataset.snap;
      place(state.y, height);
    };
    const settleSoon = () => {
      clearTimeout(settle);
      settle = setTimeout(() => {
        // a finger that is down and still sends no scroll events: wait for it to be lifted (`onRelease` settles then)
        if (held) return;
        const height = heightOf();
        const target = barSettle(state.y, height, up);
        if (target !== state.y) snapTo(target, height);
      }, SETTLE_MS);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(follow);
      // every scroll event, a momentum scroll's too, starts the wait again
      settleSoon();
    };
    const onTouchStart = () => {
      held = true;
    };
    const onRelease = () => {
      held = false;
      settleSoon();
    };
    const onFocus = () => snapTo(0, heightOf());
    place(0, heightOf());
    if (covered) return;
    const targets = [scroller ?? window, window];
    targets.forEach((target) =>
      target.addEventListener('scroll', onScroll, { passive: true }),
    );
    bar.addEventListener('focusin', onFocus);
    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchend', onRelease, { passive: true });
    document.addEventListener('touchcancel', onRelease, { passive: true });
    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchend', onRelease);
      document.removeEventListener('touchcancel', onRelease);
      targets.forEach((target) =>
        target.removeEventListener('scroll', onScroll),
      );
      bar.removeEventListener('focusin', onFocus);
      cancelAnimationFrame(frame);
      clearTimeout(settle);
      clearTimeout(snapEnd);
      delete bar.dataset.snap;
      bar.style.removeProperty('--ph-bar-y');
      bar.style.removeProperty('--ph-bar-o');
      bar.style.removeProperty('--ph-bar-t');
      delete screen.dataset.bar;
    };
  }, [bar, scroller, covered]);
}
