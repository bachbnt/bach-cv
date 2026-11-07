/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { Clapperboard, TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Why there is nothing to show, as the empty and error panels of a video site: centred, a round grey mark, the title, one line under
 * it and the way forward as a pill. Same roles as the Standard StateNotice: `empty` (with a way forward) or `error` (with a retry).
 */
export function StreamStateNotice({
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
  const Icon = kind === 'error' ? TriangleAlert : Clapperboard;
  return (
    <div
      role={kind === 'error' ? 'alert' : 'status'}
      data-state={kind}
      className={cn(
        'mx-auto flex w-full max-w-[480px] flex-col items-center gap-1 px-4 py-10 text-center',
        className,
      )}
    >
      <span
        aria-hidden='true'
        className={cn(
          'mb-3 grid size-20 place-items-center rounded-full bg-sm-surface',
          kind === 'error' ? 'text-sm-red-ink' : 'text-sm-mute',
        )}
      >
        <Icon className='size-9' strokeWidth={1.5} />
      </span>
      <Heading className='text-lg/[1.3] font-medium'>{title}</Heading>
      <p className='text-sm/[1.5] text-sm-mute'>{body}</p>
      {children && (
        <div className='mt-4 flex flex-wrap justify-center gap-2'>
          {children}
        </div>
      )}
    </div>
  );
}
