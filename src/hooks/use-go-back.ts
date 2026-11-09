/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

/** Whether the browser has a page to go back to: a page opened in a new tab has none. */
export const canGoBack = (historyLength: number): boolean => historyLength > 1;

/** "Go back" of the 404 screens in every skin: the previous page if there is one, otherwise the home page. */
export function useGoBack(): () => void {
  const router = useRouter();
  return useCallback(
    () => (canGoBack(window.history.length) ? router.back() : router.push('/')),
    [router],
  );
}
