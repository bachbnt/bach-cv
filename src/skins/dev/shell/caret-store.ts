/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { useSyncExternalStore } from 'react';

export interface Caret {
  line: number;
  column: number;
}

/** Where the caret of the editor is. Only the status bar reads it, so a click re-renders that one text and not the whole shell. */
export interface CaretStore {
  get: () => Caret;
  set: (caret: Caret) => void;
  subscribe: (listener: () => void) => () => void;
}

/** One store per mounted shell (the caret starts at Ln 1, Col 1 again when the skin is opened again). */
export function createCaretStore(): CaretStore {
  let caret: Caret = { line: 1, column: 1 };
  const listeners = new Set<() => void>();
  return {
    get: () => caret,
    set: (next) => {
      if (next.line === caret.line && next.column === caret.column) return;
      caret = next;
      listeners.forEach((listener) => listener());
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

export function useCaret(store: CaretStore): Caret {
  return useSyncExternalStore(store.subscribe, store.get, store.get);
}
