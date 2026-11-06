/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import type { ReactNode } from 'react';
import { statesCopy } from '@/content/copy/states';
import { useCopy } from '@/lib/i18n/copy';

/** Wraps skeleton blocks so a screen reader hears one "Loading" instead of nothing. */
export function LoadingBlock({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const copy = useCopy(statesCopy);
  return (
    <div
      role='status'
      aria-busy='true'
      aria-label={copy.loading}
      className={className}
    >
      {children}
    </div>
  );
}
