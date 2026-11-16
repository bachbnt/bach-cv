/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ReactNode } from 'react';

/** One filter as a labelled group of chips. */
export function ProjectsFilterGroup({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div role='group' aria-label={label} className='flex flex-col gap-2.5'>
      <span
        aria-hidden='true'
        className='text-[13px] leading-none font-semibold tracking-[0.06em] text-ph-mute uppercase'
      >
        {label}
      </span>
      <div className='flex flex-wrap gap-2'>{children}</div>
    </div>
  );
}
