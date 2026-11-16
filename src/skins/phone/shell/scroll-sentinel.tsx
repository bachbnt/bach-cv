/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useScrollEdge } from '@/skins/phone/shell/title-context';

/** A hairline at the very top of an app that leaves the screen as soon as the page scrolls: it is what tells the app bar that content is under it. */
export function PhScrollSentinel() {
  const edge = useScrollEdge();
  return (
    <i
      ref={edge}
      aria-hidden='true'
      className='pointer-events-none absolute inset-x-0 top-0 h-px'
    />
  );
}
