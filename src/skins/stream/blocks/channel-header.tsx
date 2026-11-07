/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Image from 'next/image';
import { DownloadCv } from '@/components/download-cv';
import { aboutCopy } from '@/content/copy/about';
import { homeCopy } from '@/content/copy/home';
import { localize } from '@/lib/content/schema';
import { shell } from '@/lib/content/shell';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { useProfileQuery } from '@/lib/query/use-content';
import { cn } from '@/lib/utils';
import { CV_PILL } from '@/skins/stream/ui/cv-pill';
import { StreamAskBotButton } from '@/skins/stream/ui/stream-ask-bot-button';
import { StreamTag } from '@/skins/stream/ui/stream-chip';

/**
 * The top of a channel page: the banner (the first cover of Standard's About), the round photo, the name, the headline, the
 * specialties as the tags of the channel and, where a video site has Subscribe, Download CV and Ask BB Bot. The name is the one `h1`.
 */
export function ChannelHeader() {
  const about = useCopy(aboutCopy);
  const home = useCopy(homeCopy);
  const { lang } = useLang();
  const { data: profile } = useProfileQuery();
  const specialties = (profile?.specialties ?? []).filter((s) => s.visible);
  const banner = profile?.covers?.[0];

  return (
    <header>
      {banner ? (
        <div className='relative aspect-[16/5] w-full overflow-hidden bg-sm-hover min-[701px]:aspect-[5/1] min-[701px]:max-h-[210px] min-[701px]:rounded-xl'>
          <Image
            src={banner}
            alt={`${about.coverAlt} ${shell.name}`}
            fill
            sizes='(min-width: 1100px) 1000px, 100vw'
            priority
            className='object-cover object-[50%_40%]'
          />
        </div>
      ) : (
        <div
          aria-hidden='true'
          className='sm-stage aspect-[16/5] w-full min-[701px]:aspect-[5/1] min-[701px]:max-h-[210px] min-[701px]:rounded-xl'
        />
      )}
      <div className='grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-3 px-3 pt-4 min-[701px]:gap-x-6 min-[701px]:px-0'>
        {shell.avatar && (
          <div className='relative size-20 overflow-hidden rounded-full bg-sm-hover min-[701px]:row-span-2 min-[701px]:size-32 min-[1100px]:size-40'>
            <Image
              src={shell.avatar}
              alt={`${about.avatarAlt} ${shell.name}`}
              fill
              sizes='160px'
              priority
              className='object-cover object-[50%_35%]'
            />
          </div>
        )}
        <div className='min-w-0 min-[701px]:self-end'>
          <h1 className='text-3xl/[1.1] font-bold tracking-tight min-[701px]:text-4xl/[1.1]'>
            {shell.name}
          </h1>
          <p className='mt-1.5 text-sm text-sm-mute min-[701px]:text-base'>
            {localize(shell, lang).headline}
          </p>
        </div>
        <div className='col-span-2 min-w-0 min-[701px]:col-span-1 min-[701px]:col-start-2 min-[701px]:self-start'>
          {specialties.length > 0 && (
            <ul className='m-0 flex list-none flex-wrap gap-2 p-0'>
              {specialties.map((s) => (
                <li key={s.name}>
                  <StreamTag
                    className={cn(
                      'h-7 rounded-lg px-2.5 text-[13px] font-medium',
                      s.tone === 'primary'
                        ? 'bg-sm-chip-on text-sm-chip-on-ink'
                        : 'bg-sm-chip',
                    )}
                  >
                    {s.name}
                  </StreamTag>
                </li>
              ))}
            </ul>
          )}
          <div className='mt-3 flex flex-wrap items-center gap-2'>
            <DownloadCv label={home.downloadCv} className={CV_PILL} />
            <StreamAskBotButton />
          </div>
        </div>
      </div>
    </header>
  );
}
