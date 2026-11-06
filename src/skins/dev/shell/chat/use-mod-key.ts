/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};
const isApple = () => /Mac|iPhone|iPad/.test(navigator.platform);

/** The key that goes with the chat shortcut on this device: `⌘` on Apple devices, `Ctrl+` elsewhere (`⌘` while rendering on the server). */
export function useModKey(): string {
  return useSyncExternalStore(
    subscribe,
    () => (isApple() ? '⌘' : 'Ctrl+'),
    () => '⌘',
  );
}
