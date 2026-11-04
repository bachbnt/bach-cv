/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ReactNode } from 'react';

/** The card shown in place of the projects: nothing to show yet, or they could not be loaded. */
export function ProjectsNotice({
  title,
  body,
  children,
}: {
  title: string;
  body: string;
  children?: ReactNode;
}) {
  return (
    <div
      role='status'
      className='mt-2 flex max-w-[640px] flex-col items-start gap-5 rounded-3xl border bg-white p-8'
    >
      <div>
        <h2 className='mb-2 text-[28px]'>{title}</h2>
        <p className='text-base leading-[1.6] text-[#3a404c]'>{body}</p>
      </div>
      {children}
    </div>
  );
}
