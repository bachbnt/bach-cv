/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Link from 'next/link';
import { useState, type ComponentProps } from 'react';

/**
 * A `Link` that prefetches its page when the visitor shows intent (the pointer comes over it, it gets the focus, a finger touches it)
 * instead of when it scrolls into view. Next.js prefetches every visible link by default, which on a first visit downloads the code
 * of every other page (about 90 KB gzip) before the visitor has chosen one; this keeps the click as quick and leaves the rest alone.
 */
export function IntentLink({
  onPointerEnter,
  onFocus,
  onTouchStart,
  ...props
}: Omit<ComponentProps<typeof Link>, 'prefetch'>) {
  const [intent, setIntent] = useState(false);
  return (
    <Link
      {...props}
      prefetch={intent ? null : false}
      onPointerEnter={(event) => {
        setIntent(true);
        onPointerEnter?.(event);
      }}
      onFocus={(event) => {
        setIntent(true);
        onFocus?.(event);
      }}
      onTouchStart={(event) => {
        setIntent(true);
        onTouchStart?.(event);
      }}
    />
  );
}
