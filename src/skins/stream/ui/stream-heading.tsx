/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** The heading of a block, 20px bold like a video site's section titles, with an optional link at its end. */
export function StreamHeading({
  id,
  level = 2,
  action,
  className,
  children,
}: {
  id?: string;
  level?: 2 | 3;
  /** a link to the full list (Standard's "All projects", "Full resume") */
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  const Heading = `h${level}` as const;
  return (
    <div
      className={cn(
        'mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1',
        className,
      )}
    >
      <Heading id={id} className='text-xl/[1.3] font-bold'>
        {children}
      </Heading>
      {action}
    </div>
  );
}
