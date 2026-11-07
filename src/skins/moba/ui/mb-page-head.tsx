/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * The head of a page inside the panel: the h1 (the page's Standard title), an intro and, on the right, the actions or a count. The top of
 * the panel already names the place, so this is the page speaking.
 */
export function MbPageHead({
  title,
  intro,
  aside,
  className,
}: {
  title: string;
  intro?: string;
  aside?: ReactNode;
  className?: string;
}) {
  return (
    <header
      data-part=''
      style={{ '--i': 0 } as CSSProperties}
      className={cn(
        'mb-rise flex flex-wrap items-end justify-between gap-x-6 gap-y-4 px-6 pt-7 pb-6 max-[719px]:px-4',
        className,
      )}
    >
      <div className='min-w-0 max-w-[560px]'>
        <h1 className='text-[44px] leading-[0.98] text-mb-title max-[719px]:text-[36px]'>
          {title}
        </h1>
        <span aria-hidden='true' className='mb-hairline mt-4 block w-24' />
        {intro && (
          <p className='mt-4 text-[17px] leading-[1.55] text-mb-ink/85'>
            {intro}
          </p>
        )}
      </div>
      {aside}
    </header>
  );
}
