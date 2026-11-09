/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { travelShellCopy } from '@/content/copy/travel-shell';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';

const SIDE = {
  left: 'md:top-4 md:left-4 md:w-[min(420px,calc(100%-100px))] md:max-h-[calc(100%-2rem)]',
  right:
    'md:top-4 md:right-[78px] md:w-[min(440px,calc(100%-100px))] md:max-h-[calc(100%-2rem)]',
  wide: 'md:right-[78px] md:bottom-4 md:left-4 md:max-h-[calc(100%-2rem)]',
} as const;

/**
 * The page's card over the map. On a wide screen it floats at the left, the right or along the bottom; on a phone it is a sheet that
 * rises from the bottom with a handle (a button) that makes it taller or shorter, so the map above stays in view. The page inside keeps
 * its own heading; the sheet is a `section` named by it.
 */
export function TlPanel({
  side,
  labelledBy,
  className,
  children,
}: {
  side: keyof typeof SIDE;
  labelledBy: string;
  className?: string;
  children: ReactNode;
}) {
  const words = useCopy(travelShellCopy).panel;
  const [tall, setTall] = useState(false);
  return (
    <section
      aria-labelledby={labelledBy}
      data-tall={tall || undefined}
      className={cn(
        'tl-panel tl-rise pointer-events-auto absolute right-0 bottom-0 left-0 flex min-h-0 flex-col overflow-hidden rounded-t-[26px] border border-tl-line bg-tl-panel shadow-tl-card transition-[height] duration-300 max-md:h-[46%] max-md:data-[tall]:h-[88%] md:absolute md:right-auto md:bottom-auto md:left-auto md:h-auto md:rounded-3xl',
        SIDE[side],
        className,
      )}
    >
      <button
        type='button'
        aria-expanded={tall}
        aria-label={tall ? words.collapse : words.expand}
        onClick={() => setTall((v) => !v)}
        className='flex w-full flex-none cursor-pointer items-center justify-center gap-1 pt-2 pb-1 md:hidden'
      >
        <i
          aria-hidden='true'
          className='h-[5px] w-11 rounded-[3px] bg-tl-muted opacity-60'
        />
        {tall ? (
          <ChevronDown aria-hidden='true' className='size-4 text-tl-muted' />
        ) : (
          <ChevronUp aria-hidden='true' className='size-4 text-tl-muted' />
        )}
      </button>
      <div className='tl-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain'>
        {children}
      </div>
    </section>
  );
}
