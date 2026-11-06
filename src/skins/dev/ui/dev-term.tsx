/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

/** The terminal card: the hero of Home and the head of every page. Compose it with `DevTermHead` and `DevTermBody`. */
export function DevTerm({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot='dev-term'
      className={cn(
        'overflow-hidden rounded-[12px] border border-line-2 bg-chrome shadow-[0_24px_60px_rgba(0,0,0,0.3)] [html:not(.dark)_&]:shadow-[0_18px_40px_rgba(31,35,40,0.1)]',
        className,
      )}
      {...props}
    />
  );
}

/** The title bar of a terminal card: the window lights and the shell title. */
export function DevTermHead({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot='dev-term-head'
      className={cn(
        'flex items-center gap-3 border-b border-line bg-chrome-2 px-3.5 py-2.5 font-code text-[12px] leading-[normal] font-normal text-mute',
        className,
      )}
      {...props}
    />
  );
}

/** The screen of a terminal card. `as='main'` for a card that is the main landmark of its page. */
export function DevTermBody({
  as: Tag = 'div',
  className,
  ...props
}: ComponentProps<'div'> & { as?: 'div' | 'main' }) {
  return (
    <Tag
      data-slot='dev-term-body'
      className={cn(
        'px-6 pt-5 pb-[26px] font-code text-[14.5px] leading-[1.75] font-normal max-[520px]:px-4 max-[520px]:pt-4 max-[520px]:pb-[22px] max-[520px]:text-[13px]',
        className,
      )}
      {...props}
    />
  );
}
