/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Download, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import { useChat } from '@/components/chat/chat-provider';
import { chatCopy } from '@/content/copy/chat';
import { commonCopy } from '@/content/copy/common';
import { homeCopy } from '@/content/copy/home';
import { mobaHomeCopy } from '@/content/copy/moba-home';
import { useLive } from '@/hooks/use-live';
import { fill } from '@/lib/chat/fill';
import { shell } from '@/lib/content/shell';
import { careerYears } from '@/lib/derive/career-years';
import { useCopy } from '@/lib/i18n/copy';
import { useContentQuery } from '@/lib/query/use-content';
import { useOverlays } from '@/skins/moba/shell/overlay-context';
import { MbButton } from '@/skins/moba/ui/mb-button';

/** The champion select: the title and the intro, the two main actions, and the owner's photo in a gold frame with the level (the years in software). */
export function HomeHero() {
  const copy = useCopy(homeCopy);
  const mb = useCopy(mobaHomeCopy);
  const common = useCopy(commonCopy);
  const chat = useCopy(chatCopy);
  const live = useLive();
  const { openChat } = useChat();
  const { openCv } = useOverlays();
  const { data: jobs } = useContentQuery('experience');
  const years = jobs
    ? careerYears(
        jobs.map((job) => job.startMonth),
        new Date(),
      )
    : null;
  return (
    <section
      data-part=''
      style={{ '--i': 0 } as React.CSSProperties}
      className='mb-rise grid gap-6 px-6 pt-7 pb-8 min-[900px]:grid-cols-[1fr_230px] max-[719px]:px-4'
    >
      <div className='flex min-w-0 flex-col gap-5'>
        <p className='text-[10px] leading-none font-bold tracking-[0.24em] text-mb-teal-ink uppercase'>
          {mb.kickers.hero}
        </p>
        <h1 className='text-[40px] leading-[1.02] text-mb-title max-[719px]:text-[32px]'>
          {copy.title}
        </h1>
        <span aria-hidden='true' className='mb-hairline block w-24' />
        <p className='max-w-[560px] text-[17px] leading-[1.6] text-mb-ink/90'>
          {copy.intro}
        </p>
        <div className='flex flex-wrap gap-3'>
          {live.features.cvDownload && (
            <MbButton
              variant='gold'
              onClick={openCv}
              aria-label={common.downloadCv}
            >
              <Download aria-hidden='true' className='size-4' />
              {copy.downloadCv}
            </MbButton>
          )}
          {live.features.chat && (
            <MbButton onClick={openChat}>
              <MessageCircle aria-hidden='true' className='size-4' />
              {chat.askButton}
            </MbButton>
          )}
        </div>
      </div>
      {shell.avatar && (
        <div className='relative mx-auto aspect-[3/4] w-full max-w-[230px] self-start max-[899px]:max-w-[200px]'>
          <div className='mb-portrait absolute inset-0'>
            <Image
              src={shell.avatar}
              alt={fill(mb.portraitAlt, { name: shell.name })}
              fill
              priority
              sizes='230px'
              className='object-cover object-[50%_35%]'
            />
          </div>
          {years !== null && (
            <span
              className='mb-badge absolute -right-2 -bottom-2 scale-125'
              role='img'
              aria-label={fill(mb.yearsLabel, { n: years })}
            >
              {years}
            </span>
          )}
        </div>
      )}
    </section>
  );
}
