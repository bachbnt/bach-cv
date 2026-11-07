/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Image from 'next/image';
import { aboutCopy } from '@/content/copy/about';
import { chatCopy } from '@/content/copy/chat';
import { streamChannelCopy } from '@/content/copy/stream-channel';
import { useLive } from '@/hooks/use-live';
import { shell } from '@/lib/content/shell';
import { useCopy } from '@/lib/i18n/copy';
import { useProfileQuery } from '@/lib/query/use-content';
import { ChannelDetails } from '@/skins/stream/blocks/channel-details';
import { ChannelLinks } from '@/skins/stream/blocks/channel-links';
import { StreamAskBotButton } from '@/skins/stream/ui/stream-ask-bot-button';
import { StreamSkeleton } from '@/skins/stream/ui/stream-skeleton';

/**
 * The first tab of the channel, the About panel of a video site: the Description (the profile summary of Standard), the Links, and the
 * Details. Beside it, the second cover as the video the channel features and the Ask BB Bot card of Standard's contact band.
 */
export function ChannelAboutPanel() {
  const about = useCopy(aboutCopy);
  const { about: words } = useCopy(streamChannelCopy);
  const chat = useCopy(chatCopy);
  const live = useLive();
  const { data: profile, isPending } = useProfileQuery();
  const featured = profile?.covers?.[1];

  return (
    <div className='grid gap-x-10 gap-y-8 px-3 py-6 min-[701px]:px-0 min-[1000px]:grid-cols-[minmax(0,1fr)_340px]'>
      <div className='flex min-w-0 flex-col gap-6'>
        <section aria-labelledby='description-h'>
          <h2 id='description-h' className='mb-2 text-lg/[1.3] font-bold'>
            {words.description}
          </h2>
          {isPending ? (
            <div aria-hidden='true' className='flex flex-col gap-2'>
              <StreamSkeleton className='h-4 w-full rounded-md' />
              <StreamSkeleton className='h-4 w-11/12 rounded-md' />
              <StreamSkeleton className='h-4 w-2/3 rounded-md' />
            </div>
          ) : (
            profile?.summary && (
              <p className='max-w-[640px] text-base/[1.6]'>{profile.summary}</p>
            )
          )}
        </section>
        <ChannelLinks />
        <ChannelDetails />
      </div>
      <aside className='flex min-w-0 flex-col gap-4 min-[1000px]:pt-1'>
        {featured && (
          <div className='relative aspect-video w-full overflow-hidden rounded-xl bg-sm-hover'>
            <Image
              src={featured}
              alt={`${about.coverAlt} ${shell.name}`}
              fill
              sizes='(min-width: 1000px) 340px, 100vw'
              className='object-cover'
            />
          </div>
        )}
        {live.features.chat && (
          <div className='flex flex-col items-start gap-3 rounded-xl bg-sm-surface p-4'>
            <h2 className='text-base/[1.3] font-bold'>{chat.askCard.title}</h2>
            <p className='text-sm/[1.5] text-sm-mute'>{chat.askCard.body}</p>
            <StreamAskBotButton text='chat' variant='blue' />
          </div>
        )}
      </aside>
    </div>
  );
}
