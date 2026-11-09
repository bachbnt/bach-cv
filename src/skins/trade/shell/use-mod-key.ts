/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

const isApple = () => {
  const nav = navigator as Navigator & {
    userAgentData?: { platform?: string };
  };
  return /mac|iphone|ipad|ipod/i.test(
    nav.userAgentData?.platform ?? nav.platform ?? '',
  );
};

/**
 * The name of the command key to show in a shortcut hint: `⌘` on Apple platforms, `Ctrl` elsewhere (the handlers accept both). The
 * server and the first render say `Ctrl`; the client corrects it right after, so hydration never differs.
 */
export function useModKey(): 'Ctrl' | '⌘' {
  return useSyncExternalStore(
    subscribe,
    () => (isApple() ? '⌘' : 'Ctrl'),
    () => 'Ctrl',
  );
}
