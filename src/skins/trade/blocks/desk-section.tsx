/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * A widget of the desk pages: a header strip with a small kicker, the heading and optional actions, then the body. The heading is an `h2`
 * and names the section; `anchor` is the id of the section itself, for a link to `#contact`.
 */
export function DeskSection({
  id,
  anchor,
  title,
  kicker,
  actions,
  className,
  bodyClassName,
  children,
}: {
  id: string;
  anchor?: string;
  title: string;
  kicker?: string;
  actions?: ReactNode;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={anchor}
      aria-labelledby={`${id}-h`}
      className={cn(
        'min-w-0 scroll-mt-3 rounded-md border border-tv-line bg-tv-panel',
        className,
      )}
    >
      <header className='flex min-h-9 flex-wrap items-center gap-x-2.5 gap-y-1 border-b border-tv-line px-3 py-1.5'>
        <h2 id={`${id}-h`} className='text-[13px] font-bold'>
          {title}
        </h2>
        {kicker && (
          <span
            aria-hidden='true'
            className='text-[10px] font-bold tracking-wider text-tv-dim uppercase'
          >
            {kicker}
          </span>
        )}
        {actions && <div className='ml-auto'>{actions}</div>}
      </header>
      <div className={cn('p-3', bodyClassName)}>{children}</div>
    </section>
  );
}
