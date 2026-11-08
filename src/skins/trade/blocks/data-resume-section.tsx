/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { type ReactNode } from 'react';

export const HEADING = 'px-3.5 pt-5 pb-2 text-[13px] font-bold';

export function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className='scroll-mt-4'>
      <h2 id={`${id}-h`} className={HEADING}>
        {title}
      </h2>
      {children}
    </section>
  );
}
