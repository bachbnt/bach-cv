/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};
const onApple = () => /Mac|iPhone|iPad/.test(navigator.platform);

/** The shortcut that sends the form, as this keyboard writes it: `⌘↵` on Apple devices, `Ctrl↵` elsewhere. */
export function useSubmitKeyLabel(): string {
  const apple = useSyncExternalStore(subscribe, onApple, () => true);
  return apple ? '⌘↵' : 'Ctrl↵';
}
