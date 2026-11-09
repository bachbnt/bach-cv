/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

const TOAST_MS = 2000;

/**
 * The text of the toast and whether it shows: `say` shows a message for 2 seconds. The text is cleared first, so a repeated message is
 * announced again by the live region.
 */
export function usePaymentToast() {
  const [toast, setToast] = useState({ message: '', visible: false });
  const hide = useRef<ReturnType<typeof setTimeout>>(undefined);
  const nudge = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(
    () => () => {
      clearTimeout(hide.current);
      clearTimeout(nudge.current);
    },
    [],
  );

  const say = useCallback((message: string) => {
    clearTimeout(hide.current);
    clearTimeout(nudge.current);
    setToast({ message: '', visible: false });
    nudge.current = setTimeout(() => {
      setToast({ message, visible: true });
      hide.current = setTimeout(
        () => setToast((t) => ({ ...t, visible: false })),
        TOAST_MS,
      );
    }, 20);
  }, []);

  return { toast, say };
}
