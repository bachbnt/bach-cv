/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ReactNode } from 'react';

/** The "Current" pill next to the company of the job I am in now, with a small live dot that breathes. */
export function CurrentBadge({ children }: { children: ReactNode }) {
  return (
    <span className='relative -top-0.5 ml-2.5 inline-flex items-center gap-1.5 rounded-full bg-night px-2.5 py-[3px] align-middle text-xs font-semibold text-white'>
      <span aria-hidden='true' className='current-dot' />
      {children}
    </span>
  );
}
