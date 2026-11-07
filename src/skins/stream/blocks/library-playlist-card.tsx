/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Award, Play } from 'lucide-react';
import Image from 'next/image';
import { certificatesCopy } from '@/content/copy/certificates';
import { streamLibraryCopy } from '@/content/copy/stream-library';
import { shell } from '@/lib/content/shell';
import type { Doc } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { ChannelAvatar } from '@/skins/stream/ui/channel-avatar';
import { StreamButton } from '@/skins/stream/ui/stream-button';

/**
 * The card of the playlist, which stays on the left while the list scrolls: the cover is the latest certificate, the title is the
 * `h1` of the page, then the owner, how many there are, the intro and the way into the viewer. It shows (without a cover or count) while
 * the certificates load or fail, so the page always has its title.
 */
export function LibraryPlaylistCard({
  latest,
  count,
  onOpen,
}: {
  latest: Doc<'certificates'> | undefined;
  count: number;
  onOpen: () => void;
}) {
  const copy = useCopy(certificatesCopy);
  const library = useCopy(streamLibraryCopy).playlist;

  return (
    <div className='sm-lib-card rounded-2xl p-4 min-[901px]:p-5 [@media(min-height:760px)]:min-[901px]:sticky [@media(min-height:760px)]:min-[901px]:top-20'>
      <div className='relative aspect-video overflow-hidden rounded-xl bg-sm-bg/50 shadow-lg'>
        {latest?.image ? (
          <>
            {/* the certificate does not fill a 16:9 cover: its own blurred copy fills the sides (decoration) */}
            <Image
              src={latest.image}
              alt=''
              fill
              unoptimized
              sizes='400px'
              aria-hidden='true'
              className='scale-125 object-cover opacity-60 blur-2xl'
            />
            {/* the same open as the first row of the list, which keeps the accessible name; this one is for the pointer */}
            <button
              type='button'
              tabIndex={-1}
              aria-hidden='true'
              onClick={onOpen}
              className='absolute inset-0 cursor-zoom-in'
            >
              <Image
                src={latest.image}
                alt=''
                fill
                unoptimized
                priority
                sizes='400px'
                className='object-contain p-3'
              />
            </button>
            <span className='pointer-events-none absolute top-2 left-2 inline-flex items-center rounded-md bg-sm-red px-2 py-0.5 text-xs font-semibold text-white'>
              {copy.latest}
            </span>
          </>
        ) : (
          <span
            aria-hidden='true'
            className='absolute inset-0 grid place-items-center text-sm-mute'
          >
            <Award className='size-12' strokeWidth={1.4} />
          </span>
        )}
      </div>

      <h1 className='mt-4 text-[26px]/[1.15] font-bold'>{copy.title}</h1>
      <div className='mt-3 flex items-center gap-2 text-sm'>
        <ChannelAvatar size={24} className='size-6' />
        <span className='font-medium'>{shell.name}</span>
      </div>
      {count > 0 && (
        <p className='mt-1 text-[13px] text-sm-mute'>{library.count(count)}</p>
      )}
      <p className='mt-4 text-sm/[1.5] text-sm-mute'>{copy.intro}</p>
      {count > 0 && (
        <StreamButton variant='solid' onClick={onOpen} className='mt-5 w-full'>
          <Play aria-hidden='true' className='fill-current' />
          {library.viewAll}
        </StreamButton>
      )}
    </div>
  );
}
