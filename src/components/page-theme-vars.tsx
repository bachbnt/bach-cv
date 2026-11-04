/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useEffect } from 'react';

/**
 * Menus, popovers and dialogs render outside the page frame (in a portal under <body>), so they do not inherit the
 * page colours set on the frame. Setting the same variables on the root element gives them the page's colours too.
 */
export function PageThemeVars({
  accent,
  tint,
}: {
  accent: string;
  tint: string;
}) {
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--page', accent);
    root.style.setProperty('--page-tint', tint);
    return () => {
      root.style.removeProperty('--page');
      root.style.removeProperty('--page-tint');
    };
  }, [accent, tint]);
  return null;
}
