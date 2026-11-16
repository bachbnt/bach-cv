/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useSyncExternalStore } from 'react';
import { windowMode, type WindowMode } from '@/skins/phone/shell/fold-mode';

const subscribe = (notify: () => void) => {
  window.addEventListener('resize', notify);
  return () => window.removeEventListener('resize', notify);
};

/** Whether the window holds the foldable device or the screen is the window. The shell is the one place that asks the window for its size. */
export const useWindowMode = (): WindowMode =>
  useSyncExternalStore(
    subscribe,
    () => windowMode(window.innerWidth, window.innerHeight),
    () => 'full-bleed',
  );
