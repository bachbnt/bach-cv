/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

/** The block of a page between two headings: it only gives the space above it. `DevSection` adds the `##` heading. */
export function DevSectionBox({
  className,
  ...props
}: ComponentProps<'section'>) {
  return (
    <section
      data-slot='dev-section'
      className={cn('pt-[54px]', className)}
      {...props}
    />
  );
}
