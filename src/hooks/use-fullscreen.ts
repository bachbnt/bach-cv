/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useCallback, useSyncExternalStore } from 'react';

const subscribe = (onChange: () => void) => {
  document.addEventListener('fullscreenchange', onChange);
  return () => document.removeEventListener('fullscreenchange', onChange);
};

/**
 * The full screen of the page (the Fullscreen API): whether the browser allows it (an iPhone does not for a page), whether it is on
 * now, and a toggle. Esc is the browser's own way out, and `fullscreenchange` keeps `active` true to what is on screen.
 */
export function useFullscreen() {
  const supported = useSyncExternalStore(
    () => () => undefined,
    () => document.fullscreenEnabled === true,
    () => false,
  );
  const active = useSyncExternalStore(
    subscribe,
    () => document.fullscreenElement !== null,
    () => false,
  );
  const toggle = useCallback(() => {
    const done = document.fullscreenElement
      ? document.exitFullscreen()
      : document.documentElement.requestFullscreen();
    // the browser can refuse (no user gesture, a policy): the control then stays as it was
    done.catch(() => undefined);
  }, []);
  return { supported, active, toggle };
}
