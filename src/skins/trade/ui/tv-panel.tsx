/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ReactNode } from 'react';

/**
 * The bottom panel of the terminal for a page: a header bar with the page title (the one `h1`) as its only tab, optional controls on
 * the right (a filter), then the content, which scrolls inside the panel on a wide screen and with the page on a phone.
 */
export function TvPanel({
  title,
  intro,
  actions,
  children,
}: {
  title: string;
  intro?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <>
      <div className='flex min-h-[34px] flex-none flex-wrap items-center gap-x-2 gap-y-1 border-b border-tv-line px-2 py-0.5'>
        <h1 className='h-7 rounded bg-tv-hover px-2.5 text-[13px]/7 font-medium'>
          {title}
        </h1>
        {actions && (
          <div className='ml-auto flex flex-wrap items-center gap-1.5'>
            {actions}
          </div>
        )}
      </div>
      <div className='min-h-0 flex-1 overflow-auto max-[1100px]:overflow-visible'>
        {intro && (
          <p className='max-w-[720px] px-3.5 pt-3 text-[13px]/[1.5] text-tv-mute'>
            {intro}
          </p>
        )}
        {children}
      </div>
    </>
  );
}
