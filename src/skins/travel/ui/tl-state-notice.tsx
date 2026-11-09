/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ReactNode } from 'react';
import { TlStateArt, type StateArt } from '@/skins/travel/ui/tl-art';
import { cn } from '@/lib/utils';

/** The card of an empty or failed block: a small trip drawing, the Standard title and body, and a way out. */
export function TlStateNotice({
  kind,
  title,
  body,
  kicker,
  level = 2,
  className,
  children,
}: {
  kind: 'empty' | 'error';
  title: string;
  body: string;
  /** the trip-flavoured line above the title (decoration) */
  kicker: string;
  level?: 2 | 3;
  className?: string;
  children?: ReactNode;
}) {
  const Heading = level === 2 ? 'h2' : 'h3';
  const art: StateArt = kind === 'error' ? 'error' : 'empty';
  return (
    <div
      data-state={kind}
      role={kind === 'error' ? 'alert' : undefined}
      className={cn(
        'flex flex-col items-center gap-2 rounded-3xl border border-dashed border-tl-line bg-tl-panel-2 p-6 text-center',
        className,
      )}
    >
      <TlStateArt art={art} className='h-24 w-full max-w-[240px]' />
      <p
        aria-hidden='true'
        className='m-0 text-[11px] font-extrabold tracking-[1px] text-tl-coral uppercase'
      >
        {kicker}
      </p>
      <Heading className='m-0 text-lg font-extrabold'>{title}</Heading>
      <p className='m-0 max-w-[36ch] text-tl-muted'>{body}</p>
      {children && (
        <div className='mt-2 flex flex-wrap justify-center gap-2'>
          {children}
        </div>
      )}
    </div>
  );
}
