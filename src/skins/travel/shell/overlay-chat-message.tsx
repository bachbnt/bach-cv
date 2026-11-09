/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * One line of the conversation with the travel guide. The guide's lines are stops on the route that runs down the left of the log: a
 * dot on the road with a short dashed link to the sign (a problem is a warm note and a red dot). The visitor's lines are luggage tags
 * on the right, in coral, with the hole of the string punched in them. `bare` leaves the padding of the text to the caller (the wait).
 */
export function GuideMessage({
  who,
  tone = 'plain',
  bare = false,
  children,
}: {
  who: 'bot' | 'visitor';
  tone?: 'plain' | 'error';
  bare?: boolean;
  children: ReactNode;
}) {
  if (who === 'visitor')
    return (
      <div className='tl-rise tl-guide-tag max-w-[84%] self-end rounded-xl rounded-r-md bg-[color-mix(in_srgb,var(--tl-coral)_80%,black)] py-2.5 pr-4 pl-8 text-[14.5px]/[1.5] wrap-break-word whitespace-pre-wrap text-tl-solid select-text dark:bg-tl-coral'>
        {children}
      </div>
    );
  return (
    <div
      className={cn(
        'tl-rise relative max-w-[88%] self-start',
        // the stop on the road, and the dashed link from it to the sign
        'before:absolute before:top-[15px] before:-left-[27px] before:size-3 before:rounded-full before:border-2 before:border-tl-solid',
        'after:absolute after:top-[20px] after:-left-[15px] after:w-[15px] after:border-t-2 after:border-dashed',
        tone === 'error'
          ? 'before:bg-tl-danger after:border-tl-danger'
          : 'before:bg-tl-coral after:border-tl-coral',
      )}
    >
      <div
        className={cn(
          'rounded-2xl rounded-tl-sm text-[14.5px]/[1.5] wrap-break-word whitespace-pre-wrap select-text',
          !bare && 'px-3.5 py-2.5',
          tone === 'error'
            ? 'border border-tl-danger bg-tl-coral-2 text-tl-ink'
            : 'bg-tl-chip text-tl-ink',
        )}
      >
        {children}
      </div>
    </div>
  );
}
