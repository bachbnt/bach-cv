/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Clock, VideoOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { commonCopy } from '@/content/copy/common';
import { streamChannelCopy } from '@/content/copy/stream-channel';
import { useCopy } from '@/lib/i18n/copy';
import { ChannelPlayer } from '@/skins/stream/ui/channel-player';
import {
  StreamButton,
  StreamButtonLink,
} from '@/skins/stream/ui/stream-button';

/**
 * The 404 and Coming soon screens as the watch page of a video that cannot be played. 404 is a video that is not available (a dark
 * player with the crossed-out camera); Coming soon is a Premiere waiting room (a pulsing clock and a red segment on the scrubber: no
 * date and no countdown, because there is none). Under the player, the Standard title, words and the same two ways out.
 */
export function StreamStatusScreen({
  variant,
}: {
  variant: 'notFound' | 'soon';
}) {
  const copy = useCopy(commonCopy);
  const words = useCopy(streamChannelCopy);
  const router = useRouter();
  const text = copy.status[variant];
  const soon = variant === 'soon';

  return (
    <div className='mx-auto w-full max-w-[960px] min-[701px]:pt-4'>
      {soon ? (
        <ChannelPlayer scrubber='wait' stage>
          <span className='absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-sm bg-black/60 px-2 py-1 text-xs font-bold tracking-wide uppercase'>
            <span
              aria-hidden='true'
              className='size-[7px] animate-[sm-pulse_1.4s_infinite] rounded-full bg-sm-red'
            />
            {words.premiere.badge}
          </span>
          <div className='flex flex-col items-center gap-3'>
            <span
              aria-hidden='true'
              className='relative grid size-16 place-items-center rounded-full bg-white/10'
            >
              <span className='absolute inset-0 animate-[sm-wait-ring_2s_ease-out_infinite] rounded-full border-2 border-white/60' />
              <Clock className='size-8' />
            </span>
            <p className='text-2xl/[1.2] font-bold min-[701px]:text-3xl/[1.2]'>
              {words.premiere.title}
            </p>
            <p className='text-sm text-white/70'>{words.premiere.hint}</p>
          </div>
        </ChannelPlayer>
      ) : (
        <ChannelPlayer scrubber='idle'>
          <div className='flex flex-col items-center gap-3'>
            <span
              aria-hidden='true'
              className='grid size-16 place-items-center rounded-full bg-white/10'
            >
              <VideoOff className='size-8' />
            </span>
            <p className='text-2xl/[1.2] font-bold min-[701px]:text-3xl/[1.2]'>
              {words.unavailable.label}
            </p>
            <p className='text-sm text-white/70'>{words.unavailable.line}</p>
          </div>
        </ChannelPlayer>
      )}
      <div className='px-3 pt-4 min-[701px]:px-0'>
        <div className='flex flex-wrap items-center gap-x-3 gap-y-2'>
          <h1 className='text-xl/[1.3] font-bold'>{text.title}</h1>
          <span className='inline-flex h-6 items-center rounded-md bg-sm-chip px-2 text-xs font-medium'>
            {soon ? copy.soon : '404'}
          </span>
        </div>
        <p className='mt-3 max-w-[680px] rounded-xl bg-sm-surface p-3 text-sm/[1.5]'>
          {text.body}
        </p>
        <div className='mt-4 flex flex-wrap gap-2'>
          <StreamButtonLink variant='solid' href='/'>
            {copy.status.home}
          </StreamButtonLink>
          <StreamButton onClick={() => router.back()}>
            {copy.status.back}
          </StreamButton>
        </div>
      </div>
    </div>
  );
}
