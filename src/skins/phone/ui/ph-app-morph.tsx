/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { ViewTransition, type ReactNode } from 'react';
import type { PageKey } from '@/lib/content/schema';

/**
 * The name of an app on the home screen and on its screen: a page change between the two is a shared-element transition, so the icon grows into
 * the screen when an app opens and the screen shrinks back into the icon when it closes (the pace of the animation is
 * `::view-transition-group(.ph-morph)` in `phone.css`). This wraps the TILE of the app on the home screen.
 */
export function PhAppMorph({
  page,
  children,
}: {
  page: PageKey;
  children: ReactNode;
}) {
  return (
    <ViewTransition name={`ph-app-${page}`} share='ph-morph' default='none'>
      {children}
    </ViewTransition>
  );
}

/**
 * The other end of the name: a sheet as big as the SCREEN, not as the page (which is as tall as its content and has square corners), with the
 * corners of the display (`--ph-screen-radius`), behind the bars and the page. The icon grows into it; the page itself comes in by its own
 * fade. It is empty and hidden from readers and from the pointer, and is the first child of the screen, which is a stacking context of its own
 * so that `-z-10` is under the page and above the wallpaper.
 */
export function PhAppFrame({ page }: { page: PageKey }) {
  return (
    <ViewTransition name={`ph-app-${page}`} share='ph-morph' default='none'>
      <div
        aria-hidden='true'
        className='pointer-events-none fixed inset-0 -z-10 bg-ph-sheet [border-radius:var(--ph-screen-radius,0px)]'
      />
    </ViewTransition>
  );
}
