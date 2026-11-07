/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useCallback, useState } from 'react';
import {
  LAYOUT_KEY,
  parseLayout,
  type Layout,
} from '@/skins/trade/blocks/shell-layout';

const read = (): Layout => {
  try {
    return parseLayout(window.localStorage.getItem(LAYOUT_KEY));
  } catch {
    return parseLayout(null);
  }
};

/** The layout of the terminal, kept in the browser under `bach-cv-trade-layout` (a small UI preference, never content). */
export function useLayoutState() {
  const [layout, setLayout] = useState<Layout>(read);
  const update = useCallback((patch: Partial<Layout>) => {
    setLayout((current) => {
      const next = { ...current, ...patch };
      try {
        window.localStorage.setItem(LAYOUT_KEY, JSON.stringify(next));
      } catch {
        // storage is blocked: the layout still works until the page is closed
      }
      return next;
    });
  }, []);
  return { layout, update };
}
