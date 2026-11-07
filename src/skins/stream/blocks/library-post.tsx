/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { MessageSquarePlus } from 'lucide-react';
import { ServiceArt } from '@/components/services/service-art';
import { servicesCopy } from '@/content/copy/services';
import { streamLibraryCopy } from '@/content/copy/stream-library';
import { shell } from '@/lib/content/shell';
import type { Doc } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import { ChannelAvatar } from '@/skins/stream/ui/channel-avatar';
import { StreamButton } from '@/skins/stream/ui/stream-button';

/**
 * One service as a post of a channel's Community tab: the owner's picture and name, the service as the text of the post, Standard's
 * drawing as its picture, and the action that picks the service as the topic of the message (the same as the topic chip).
 */
export function LibraryPost({
  service,
  index,
  asking,
  onAsk,
}: {
  service: Doc<'services'>;
  /** place in the feed, for the staggered entrance */
  index: number;
  /** this service is the topic of the message */
  asking: boolean;
  onAsk: () => void;
}) {
  const label = useCopy(servicesCopy).list.label;
  const copy = useCopy(streamLibraryCopy).community;
  return (
    <li
      style={{ animationDelay: `${Math.min(index, 6) * 60}ms` }}
      className='animate-[sm-lib-rise_0.4s_cubic-bezier(0.2,0.7,0.2,1)_both]'
    >
      <article className='rounded-2xl border border-sm-line p-4 min-[701px]:p-5'>
        <div className='flex items-center gap-3'>
          <ChannelAvatar size={40} className='size-10' />
          <div className='min-w-0'>
            <p className='text-sm/[1.3] font-medium'>{shell.name}</p>
            <p className='text-xs text-sm-mute'>{label}</p>
          </div>
        </div>
        <h2 className='mt-4 text-lg/[1.3] font-bold'>{service.name}</h2>
        <p className='mt-1.5 text-[15px]/[1.55]'>{service.description}</p>
        <div className='mt-4 overflow-hidden rounded-xl'>
          <ServiceArt art={service.art} />
        </div>
        <div className='mt-3 flex'>
          <StreamButton
            variant={asking ? 'solid' : 'tonal'}
            aria-pressed={asking}
            aria-label={copy.askAboutLabel(service.name)}
            onClick={onAsk}
            className={cn(!asking && 'bg-transparent hover:bg-sm-hover')}
          >
            <MessageSquarePlus aria-hidden='true' />
            {copy.askAbout}
          </StreamButton>
        </div>
      </article>
    </li>
  );
}
