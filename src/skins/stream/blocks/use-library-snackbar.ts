/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const SHOW_MS = 2000;

/**
 * The message of the snackbar and whether it shows. `say` clears the text first so the same message is announced again, then shows it
 * for two seconds (the timing of Standard's payment toast).
 */
export function useLibrarySnackbar() {
  const [snack, setSnack] = useState({ message: '', visible: false });
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
    setSnack({ message: '', visible: false });
    nudge.current = setTimeout(() => {
      setSnack({ message, visible: true });
      hide.current = setTimeout(
        () => setSnack((s) => ({ ...s, visible: false })),
        SHOW_MS,
      );
    }, 20);
  }, []);

  return { snack, say };
}
