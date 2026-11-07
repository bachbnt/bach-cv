/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * A widget of the Home dashboard: a header bar with the title (and a link or a control on the right) over a body, in the manner of
 * the widgets of a chart terminal. `id` is the anchor the section bar of Home scrolls to.
 */
export function ShellWidget({
  id,
  title,
  titleId,
  action,
  className,
  bodyClassName,
  children,
}: {
  id?: string;
  title: string;
  titleId: string;
  action?: ReactNode;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={titleId}
      className={cn(
        'tv-rise scroll-mt-2 overflow-hidden rounded-md border border-tv-line bg-tv-panel',
        className,
      )}
    >
      <header className='flex min-h-10 flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-tv-line px-3.5 py-1'>
        <h2 id={titleId} className='text-[13px] font-bold'>
          {title}
        </h2>
        {action}
      </header>
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}
