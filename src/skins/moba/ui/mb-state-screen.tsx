/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * The big-number screen of 404, Coming soon and maintenance: a kicker, a huge word, the title and the text, and the way out. `inPanel` is
 * the version inside the page panel; the other one fills the window.
 */
export function MbStateScreen({
  code,
  kicker,
  title,
  body,
  children,
  inPanel = true,
  tone = 'gold',
}: {
  code: string;
  kicker: string;
  title: string;
  body: string;
  children?: ReactNode;
  inPanel?: boolean;
  tone?: 'gold' | 'red';
}) {
  return (
    <section
      className={cn(
        'flex flex-col items-start gap-5',
        inPanel
          ? 'px-6 py-12 max-[719px]:px-4 max-[719px]:py-8'
          : 'mx-auto w-full max-w-[640px] px-6',
      )}
    >
      <p
        className={cn(
          'text-[11px] leading-none font-bold tracking-[0.24em] uppercase',
          tone === 'red' ? 'text-mb-red-ink' : 'text-mb-teal-ink',
        )}
      >
        {kicker}
      </p>
      <p
        aria-hidden='true'
        className='mb-code font-mb-display text-[88px] leading-[0.9] font-bold text-mb-gold max-[719px]:text-[64px]'
      >
        {code}
      </p>
      <h1 className='text-[34px] leading-[1.05] text-mb-title max-[719px]:text-[28px]'>
        {title}
      </h1>
      <p className='max-w-[520px] text-[17px] leading-[1.55] text-mb-mute'>
        {body}
      </p>
      {children && <div className='mt-1 flex flex-wrap gap-3'>{children}</div>}
    </section>
  );
}
