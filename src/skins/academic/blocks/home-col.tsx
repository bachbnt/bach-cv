/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * A part of a page that has no note in the margin: it stays in the left column, so the ruled margin line is never written across. (`AcRow` with
 * a note already does this; without one it is the whole width.)
 */
export function HomeCol({
  className,
  children,
  ...props
}: Omit<ComponentProps<'div'>, 'children'> & {
  children: ReactNode;
}) {
  return (
    <div className={cn('min-w-0 min-[900px]:pr-[308px]', className)} {...props}>
      {children}
    </div>
  );
}
