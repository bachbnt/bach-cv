/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import type { ReactNode } from 'react';
import { useLoopGate } from '@/hooks/use-loop-gate';

/** The "Current" pill of the role that is still going: a green outline with a dot that breathes (it stops under reduced motion, in a background tab and when it is scrolled out of view). */
export function DevLivePill({ children }: { children: ReactNode }) {
  const gate = useLoopGate();
  return (
    <span
      ref={gate}
      data-slot='dev-live'
      className='ml-2.5 inline-flex items-center gap-1.5 rounded-full border border-[color:color-mix(in_srgb,var(--dv-accent)_50%,transparent)] px-[9px] py-px align-[2px] font-code text-[11px] leading-[normal] font-semibold text-signal lowercase before:size-1.5 before:animate-[dv-blink_1.4s_infinite] before:rounded-full before:bg-signal before:content-[""] motion-reduce:before:animate-none'
    >
      {children}
    </span>
  );
}
