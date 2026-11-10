/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { copyToClipboard } from '@/lib/copy-to-clipboard';

/** Copies text and reports `copied` for a moment so the button can confirm it. A copy that did not work leaves the label unchanged. */
export function useClipboard(resetMs = 1600) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = useCallback(
    async (text: string) => {
      // the shared writer falls back to a hidden textarea where the Clipboard API is blocked, and announces a copy that worked
      if (!(await copyToClipboard(text))) return;
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), resetMs);
    },
    [resetMs],
  );

  return { copied, copy };
}
