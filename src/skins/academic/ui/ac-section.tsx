/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

/** A heading of a part of a page, written in chalk with a wavy line under it. `level` is the real heading level (the look is the same). */
export function AcHeading({
  level = 2,
  className,
  children,
  ...props
}: Omit<ComponentProps<'h2'>, 'ref'> & { level?: 2 | 3 }) {
  const Tag = `h${level}` as const;
  return (
    <Tag
      className={cn(
        'ac-line ac-glow inline-block font-ac-chalk text-[34px]/[1.1] font-normal [--ul:var(--ac-md)] [--ac-line-y:-6px] max-[760px]:text-[30px]',
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
