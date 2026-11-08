/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { commonCopy } from '@/content/copy/common';
import { tradeDeskCopy } from '@/content/copy/trade-desk';
import { useGoBack } from '@/hooks/use-go-back';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import { TvButton, TvLink } from '@/skins/trade/ui/tv-button';
import { TvCandleArt } from '@/skins/trade/ui/tv-candle-art';
import { TvChip } from '@/skins/trade/ui/tv-chip';

const TONES = {
  missing: { chip: 'down', dot: 'bg-tv-down' },
  closed: { chip: 'down', dot: 'bg-tv-down' },
  ghost: {
    chip: 'gold',
    dot: 'bg-tv-gold animate-[tv-pulse_1.6s_ease-in-out_infinite]',
  },
} as const;

/**
 * The body of a 404, Coming soon or maintenance screen, as the empty chart of a terminal: the state as a small tag (`Symbol not found`,
 * `Pre-market`, `Market closed`), the big code beside candles that draw themselves, then the title and the words of Standard.
 */
export function TvStatusBody({
  code,
  title,
  body,
  kicker,
  art = 'missing',
  children,
}: {
  code: string;
  title: string;
  body?: string;
  /** the tag above the code: the skin's name for the state */
  kicker?: string;
  art?: 'missing' | 'closed' | 'ghost';
  children?: ReactNode;
}) {
  const tone = TONES[art];
  return (
    <div className='tv-rise m-auto flex w-full max-w-[680px] flex-col gap-3 p-6'>
      {kicker && (
        <TvChip tone={tone.chip} className='gap-1.5 self-start'>
          <span
            aria-hidden='true'
            className={cn('size-1.5 rounded-full', tone.dot)}
          />
          {kicker}
        </TvChip>
      )}
      <div className='flex flex-wrap items-end gap-x-8 gap-y-3'>
        <p
          aria-hidden='true'
          className='font-bold tracking-tight text-tv-accent-ink tabular-nums text-[length:clamp(56px,10vw,96px)] leading-none'
        >
          {code}
        </p>
        <TvCandleArt variant={art} className='h-[90px] w-[250px] flex-none' />
      </div>
      <h1 className='text-2xl leading-tight font-bold'>{title}</h1>
      {body && <p className='text-sm/[1.6] text-tv-mute'>{body}</p>}
      {children}
    </div>
  );
}

/** The 404 ("Symbol not found") and Coming soon ("Pre-market") screens: the Standard words and the same two ways out. */
export function TvStatusScreen({ variant }: { variant: 'notFound' | 'soon' }) {
  const copy = useCopy(commonCopy);
  const states = useCopy(tradeDeskCopy).states;
  const goBack = useGoBack();
  const pathname = usePathname();
  const text = copy.status[variant];
  return (
    <TvStatusBody
      code={variant === 'soon' ? copy.soon : '404'}
      title={text.title}
      body={text.body}
      kicker={variant === 'soon' ? states.soonKicker : states.notFoundKicker}
      art={variant === 'soon' ? 'ghost' : 'missing'}
    >
      {variant === 'notFound' && pathname && (
        <p className='flex flex-wrap items-center gap-2 text-xs text-tv-mute'>
          {states.path}
          <code className='rounded border border-tv-line bg-tv-panel px-1.5 py-0.5 text-tv-ink [overflow-wrap:anywhere]'>
            {pathname}
          </code>
        </p>
      )}
      <div className='mt-2 flex flex-wrap gap-2'>
        <TvLink variant='primary' href='/'>
          {copy.status.home}
        </TvLink>
        <TvButton variant='outline' onClick={goBack}>
          {copy.status.back}
        </TvButton>
      </div>
    </TvStatusBody>
  );
}
