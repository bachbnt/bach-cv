/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it, vi } from 'vitest';
import { createCaretStore } from '@/skins/dev/shell/caret-store';

describe('the caret store of the Dev status bar', () => {
  it('starts at line 1, column 1', () => {
    expect(createCaretStore().get()).toEqual({ line: 1, column: 1 });
  });

  it('tells its listeners when the caret moves, and gives the new position', () => {
    const store = createCaretStore();
    const listener = vi.fn();
    store.subscribe(listener);
    store.set({ line: 4, column: 12 });
    expect(listener).toHaveBeenCalledTimes(1);
    expect(store.get()).toEqual({ line: 4, column: 12 });
  });

  it('stays quiet when the caret is clicked where it already is', () => {
    const store = createCaretStore();
    store.set({ line: 4, column: 12 });
    const listener = vi.fn();
    store.subscribe(listener);
    store.set({ line: 4, column: 12 });
    expect(listener).not.toHaveBeenCalled();
  });

  it('stops telling a listener that unsubscribed, and each store is its own', () => {
    const store = createCaretStore();
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    unsubscribe();
    store.set({ line: 2, column: 2 });
    expect(listener).not.toHaveBeenCalled();
    expect(createCaretStore().get()).toEqual({ line: 1, column: 1 });
  });
});
