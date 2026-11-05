/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useEffect } from 'react';

/**
 * Menus, popovers and dialogs render outside the page frame (in a portal under <body>), so they do not inherit the
 * page colours set on the frame. Setting the light colours on the root element gives them the page's colours too
 * (`--page` and `--page-tint` are derived from these, for light and dark, in globals.css).
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
    root.style.setProperty('--page-accent', accent);
    root.style.setProperty('--page-tint-base', tint);
    return () => {
      root.style.removeProperty('--page-accent');
      root.style.removeProperty('--page-tint-base');
    };
  }, [accent, tint]);
  return null;
}
