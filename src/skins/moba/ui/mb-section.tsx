/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * A titled section of a page: a gold rule above, an h2 with a small kicker, an optional lead and an aside (a link to the full list),
 * then the content. `order` staggers the way the sections arrive.
 */
export function MbSection({
  id,
  title,
  kicker,
  lead,
  aside,
  order = 1,
  className,
  children,
}: {
  id?: string;
  title: string;
  kicker?: string;
  lead?: string;
  aside?: ReactNode;
  order?: number;
  className?: string;
  children: ReactNode;
}) {
  const heading = id ? `${id}-h` : undefined;
  return (
    <section
      id={id}
      aria-labelledby={heading}
      data-part=''
      style={{ '--i': order } as CSSProperties}
      className={cn('mb-rise mb-section px-6 py-7 max-[719px]:px-4', className)}
    >
      <div className='mb-4 flex flex-wrap items-end justify-between gap-x-4 gap-y-2'>
        <div className='min-w-0'>
          {kicker && (
            <p className='mb-1.5 text-[10px] leading-none font-bold tracking-[0.22em] text-mb-teal-ink uppercase'>
              {kicker}
            </p>
          )}
          <h2
            id={heading}
            className='text-[30px] leading-none text-mb-title max-[719px]:text-[26px]'
          >
            {title}
          </h2>
        </div>
        {aside}
      </div>
      {lead && (
        <p className='mb-4 max-w-[560px] text-[15px] leading-[1.55] text-mb-mute'>
          {lead}
        </p>
      )}
      {children}
    </section>
  );
}
