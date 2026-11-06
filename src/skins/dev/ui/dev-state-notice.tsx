/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ReactNode } from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { DevIcon } from '@/skins/dev/icons/dev-icon';

const noticeVariants = cva(
  'flex max-w-[640px] gap-3.5 rounded-[8px] border border-line-2 bg-chrome px-[22px] py-5',
  {
    variants: {
      kind: {
        empty: 'border-dashed',
        error: 'border-l-[3px] border-l-err',
      },
    },
  },
);

/** The icon of a notice: grey, red for an error. */
const iconVariants = cva('mt-[3px] size-5 flex-none', {
  variants: { kind: { empty: 'text-dim', error: 'text-err' } },
});

/** Why there is nothing to show: `empty` (with a way forward) or `error` (with a retry). Same roles as the Standard StateNotice. */
export function DevStateNotice({
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
      className={cn(noticeVariants({ kind }), className)}
    >
      <DevIcon
        name={kind === 'error' ? 'error' : 'inbox'}
        className={iconVariants({ kind })}
      />
      <div>
        <Heading className='mb-1.5 text-[18px] leading-[normal] font-bold'>
          {title}
        </Heading>
        <p className='font-sans text-[15px]/[1.6] text-mute'>{body}</p>
        {children && (
          <div className='mt-4 flex flex-wrap gap-2.5'>{children}</div>
        )}
      </div>
    </div>
  );
}
