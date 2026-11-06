/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useSyncExternalStore } from 'react';
import {
  getServerState,
  getState,
  subscribe,
  type DevLogState,
} from '@/skins/dev/shell/devlog/store';

/** A part of the log, re-read when it changes. `select` returns something that is the same object until the log really changes. */
export function useDevLog<T>(select: (state: DevLogState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => select(getState()),
    () => select(getServerState()),
  );
}
