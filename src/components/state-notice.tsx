/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ReactNode } from 'react';
import { cn } from 'cn';

/**
 * The card shown in place of a block of data: nothing to show yet, or it could not be loaded.
 * One look for every page. `level` is the heading level, so a card inside a section stays below that section's heading.
 */
export function StateNotice({
  kind,
  title,
  body,
  icon,
  level = 2,
  className,
  children,
}: {
  kind: 'empty' | 'error';
  title: string;
  body: string;
  icon?: ReactNode;
  level?: 2 | 3;
  className?: string;
  children?: ReactNode;
}) {
  const Heading = `h${level}` as const;
  return (
    <div
      role={kind === 'error' ? 'alert' : 'status'}
      data-state={kind}
      className={cn(
        'flex max-w-[640px] flex-col items-start gap-5 rounded-3xl border bg-white p-8 text-foreground',
        className,
      )}
    >
      {icon}
      <div>
        <Heading className='mb-2 text-[28px]'>{title}</Heading>
        <p className='text-base leading-[1.6] text-[#3a404c]'>{body}</p>
      </div>
      {children}
    </div>
  );
}
