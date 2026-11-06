/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

/** The card of the Dev skin: a panel of the editor's chrome that rises and lights its edge on hover. */
export function DevCard({
  as: Tag = 'div',
  className,
  ...props
}: ComponentProps<'div'> & { as?: 'div' | 'article' }) {
  return (
    <Tag
      data-slot='dev-card'
      className={cn(
        'rounded-[8px] border border-line-2 bg-chrome px-[18px] py-4 transition-[transform,border-color,box-shadow] duration-200 ease-[ease] hover:border-[color:color-mix(in_srgb,var(--dv-accent)_65%,var(--line-2))] hover:shadow-[0_16px_36px_color-mix(in_srgb,var(--dv-accent)_14%,transparent)] hover:[transform:translateY(-3px)]',
        className,
      )}
      {...props}
    />
  );
}
