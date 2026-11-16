/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Why there is nothing to show: `empty` (with a way forward) or `error` (with a retry), a card on the screen. Same roles as Standard. */
export function PhStateNotice({
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
        'max-w-[560px] rounded-ph-panel border-l-4 bg-ph-sheet-2 px-5 py-4 shadow-ph-card',
        kind === 'error' ? 'border-ph-danger' : 'border-ph-line',
        className,
      )}
    >
      <Heading className='mb-1 text-[17px]/[1.25] font-semibold'>
        {title}
      </Heading>
      <p className='text-[15px]/[1.5] text-ph-mute'>{body}</p>
      {children && (
        <div className='mt-3.5 flex flex-wrap gap-2.5'>{children}</div>
      )}
    </div>
  );
}
