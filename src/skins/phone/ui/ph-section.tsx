/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** A group on the screen of an app: a small heading in capitals, then what belongs to it (usually cards). `level` is the heading level in the page. */
export function PhSection({
  title,
  level = 2,
  action,
  className,
  children,
  ...props
}: Omit<ComponentProps<'section'>, 'title'> & {
  title: string;
  level?: 2 | 3;
  /** a link or a button at the end of the heading line ("See all") */
  action?: ReactNode;
}) {
  const Heading = `h${level}` as const;
  return (
    <section className={cn('mt-8 first:mt-0', className)} {...props}>
      <div className='mb-2.5 flex items-center justify-between gap-3 px-1'>
        <Heading className='text-[13px] leading-none font-semibold tracking-[0.06em] text-ph-mute uppercase'>
          {title}
        </Heading>
        {action}
      </div>
      {children}
    </section>
  );
}
