/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** The head of a page: its title (the one `h1` of the page), an optional badge before it and the intro under it, as Standard words them. */
export function StreamPageHead({
  title,
  intro,
  badge,
  className,
  children,
}: {
  title: string;
  intro?: string;
  badge?: ReactNode;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={cn('mb-5 px-3 min-[701px]:px-0', className)}>
      <div className='flex flex-wrap items-center gap-3'>
        {badge}
        <h1 className='text-2xl/[1.2] font-bold'>{title}</h1>
      </div>
      {intro && (
        <p className='mt-1.5 max-w-[640px] text-sm/[1.5] text-sm-mute'>
          {intro}
        </p>
      )}
      {children}
    </div>
  );
}
