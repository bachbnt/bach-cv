/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Why there is nothing to show: `empty` (with a way forward) or `error` (with a retry), a note on a sheet of paper. Same roles as Standard. */
export function AcStateNotice({
  kind,
  title,
  body,
  level = 2,
  className,
  children,
}: {
  kind: 'empty' | 'error';
  title: string;
  body: string;
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
        'ac-paper max-w-[640px] rounded-[2px] border-l-[5px] px-[22px] py-5',
        kind === 'error' ? 'border-ac-accent' : 'border-ac-rule',
        className,
      )}
    >
      <Heading className='mb-1.5 font-ac-chalk text-[26px]/[1.15] font-normal'>
        {title}
      </Heading>
      <p className='text-[17px]/[1.5] text-ac-mute'>{body}</p>
      {children && (
        <div className='mt-4 flex flex-wrap gap-2.5'>{children}</div>
      )}
    </div>
  );
}
