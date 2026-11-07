/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

const SNACKBAR_MS = 2000;

/**
 * The text of a snackbar and whether it shows: `say` shows a message for 2 seconds. The text is cleared first, so a repeated message is
 * announced again by the live region.
 */
export function useDeskSnackbar() {
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
        SNACKBAR_MS,
      );
    }, 20);
  }, []);

  return { snack, say };
}
