/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useGoBack } from '@/hooks/use-go-back';
import { commonCopy } from '@/content/copy/common';
import { travelShellCopy } from '@/content/copy/travel-shell';
import { useCopy } from '@/lib/i18n/copy';
import { TlStateArt } from '@/skins/travel/ui/tl-art';
import { TlButton, TlButtonLink } from '@/skins/travel/ui/tl-button';
import { TlPanel } from '@/skins/travel/ui/tl-panel';

/** The 404 and Coming soon screens: a sign on the map with the Standard words and the same two ways out. */
export function TlStatusScreen({ variant }: { variant: 'notFound' | 'soon' }) {
  const copy = useCopy(commonCopy);
  const trip = useCopy(travelShellCopy).states;
  const goBack = useGoBack();
  const text = copy.status[variant];
  return (
    <TlPanel side='left' labelledBy='tl-status-title'>
      <div className='flex flex-col items-center gap-3 p-6 text-center'>
        <TlStateArt
          art={variant === 'soon' ? 'soon' : 'offTheMap'}
          className='h-32 w-full max-w-[260px]'
        />
        <p
          aria-hidden='true'
          className='m-0 text-[11.5px] font-extrabold tracking-[1px] text-tl-coral uppercase'
        >
          {variant === 'soon' ? copy.soon : '404'} ·{' '}
          {variant === 'soon' ? trip.soon : trip.offTheMap}
        </p>
        <h1
          id='tl-status-title'
          className='m-0 text-[26px]/[1.1] font-extrabold'
        >
          {text.title}
        </h1>
        <p className='m-0 text-tl-muted'>{text.body}</p>
        <div className='flex flex-wrap justify-center gap-2'>
          <TlButtonLink variant='solid' href='/'>
            {copy.status.home}
          </TlButtonLink>
          <TlButton variant='ghost' onClick={goBack}>
            {copy.status.back}
          </TlButton>
        </div>
      </div>
    </TlPanel>
  );
}
