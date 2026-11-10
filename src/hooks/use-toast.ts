/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/** How long a toast stays. */
export const TOAST_MS = 2000;
/** The pause between clearing the text and showing the next one (long enough for the live region to see the change). */
const NUDGE_MS = 20;

export interface ToastState {
  message: string;
  visible: boolean;
}

/**
 * The text of a toast and whether it shows, shared by every skin: `say` shows a message for 2 seconds. The text is cleared first, so a
 * message said twice in a row is announced twice by the live region. Timers are cleared on unmount.
 */
export function useToast(): {
  toast: ToastState;
  say: (message: string) => void;
} {
  const [toast, setToast] = useState<ToastState>({
    message: '',
    visible: false,
  });
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
    }, NUDGE_MS);
  }, []);

  return { toast, say };
}
