/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ReactNode } from 'react';

/**
 * The tinted head of a page: title with the accent bar, and a short intro.
 * Pass `children` for extra content (About puts its photo grid there).
 */
export function PageHead({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children?: ReactNode;
}) {
  return (
    <div className='rounded-b-[40px] bg-page-tint'>
      <div className='mx-auto w-full max-w-[1200px] px-5 pt-6 pb-14 min-[721px]:px-12'>
        <h1 className='text-[38px] leading-[1.04] min-[721px]:text-[60px]'>
          {title}
        </h1>
        <span
          aria-hidden='true'
          className='bar-in mt-[18px] block h-1.5 w-16 rounded-[3px] bg-page'
        />
        {intro && (
          <p className='mt-5 max-w-[620px] text-xl leading-[1.55] text-[#3a404c]'>
            {intro}
          </p>
        )}
        {children}
      </div>
    </div>
  );
}
