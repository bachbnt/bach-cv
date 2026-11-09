/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { COPIED_EVENT } from '@/lib/copied-event';

/** How long after a press a "copied" announcement still belongs to that button. */
const ARMED_MS = 1500;

/**
 * Confirmation for a copy button whose copy is made elsewhere (the Payment page copies through a shared handler that shows a
 * snackbar). `arm()` on press; `copied` is true for a moment once the clipboard really accepted the text (the site says so with
 * `COPIED_EVENT`), so a failed copy never shows a check.
 */
export function useCopyFeedback(resetMs = 1600) {
  const [copied, setCopied] = useState(false);
  const armed = useRef(false);
  const armTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const resetTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const onCopied = () => {
      if (!armed.current) return;
      armed.current = false;
      setCopied(true);
      clearTimeout(resetTimer.current);
      resetTimer.current = setTimeout(() => setCopied(false), resetMs);
    };
    window.addEventListener(COPIED_EVENT, onCopied);
    return () => {
      window.removeEventListener(COPIED_EVENT, onCopied);
      clearTimeout(armTimer.current);
      clearTimeout(resetTimer.current);
    };
  }, [resetMs]);

  const arm = useCallback(() => {
    armed.current = true;
    clearTimeout(armTimer.current);
    armTimer.current = setTimeout(() => {
      armed.current = false;
    }, ARMED_MS);
  }, []);

  return { copied, arm };
}
