/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Image from 'next/image';
import { DownloadCv } from '@/components/download-cv';
import { homeCopy } from '@/content/copy/home';
import { statesCopy } from '@/content/copy/states';
import { SKILL_CATEGORIES, localize } from '@/lib/content/schema';
import { shell } from '@/lib/content/shell';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { useContentQuery } from '@/lib/query/use-content';
import { CV_PILL } from '@/skins/stream/ui/cv-pill';
import { StreamAskBotButton } from '@/skins/stream/ui/stream-ask-bot-button';
import { StreamSkeleton } from '@/skins/stream/ui/stream-skeleton';

/** Mobile first, as on the Standard strip. */
const CATEGORY_ORDER = [
  'mobile',
  'web',
  'ai',
  'tools',
] as const satisfies readonly (typeof SKILL_CATEGORIES)[number][];
const LIMIT = 20;

/**
 * Under the player, as under a video: the title (the h1 of the page, real text), the channel row with the Download CV and Ask BB Bot
 * buttons in the place of Subscribe, and the description box with the intro of Standard's hero and, as hashtags, its technologies.
 */
export function CareerTitle() {
  const copy = useCopy(homeCopy);
  const { loading } = useCopy(statesCopy);
  const { lang } = useLang();
  const headline = localize(shell, lang).headline;
  const { data: skills = [], isPending } = useContentQuery('skills');
  const shown = CATEGORY_ORDER.flatMap((category) =>
    skills.filter((s) => s.listed && s.category === category),
  ).slice(0, LIMIT);

  return (
    <div className='px-3 min-[701px]:px-0'>
      <h1 className='mt-3 text-[clamp(20px,2.2vw,28px)]/[1.25] font-bold tracking-tight text-balance'>
        {copy.title}
      </h1>
      <div className='mt-3 flex flex-wrap items-center gap-3'>
        {shell.avatar && (
          <Image
            src={shell.avatar}
            alt={`${shell.name} reading a book`}
            width={48}
            height={48}
            priority
            className='size-12 flex-none rounded-full bg-sm-hover object-cover object-[50%_35%]'
          />
        )}
        <div className='min-w-0'>
          <p className='font-medium'>{shell.name}</p>
          <p className='text-xs text-sm-mute'>{headline}</p>
        </div>
        <div className='flex flex-wrap items-center gap-2 min-[701px]:ml-auto'>
          <DownloadCv label={copy.downloadCv} className={CV_PILL} />
          <StreamAskBotButton />
        </div>
      </div>
      <div className='mt-3 rounded-xl bg-sm-hover p-3'>
        <p className='whitespace-pre-line'>{copy.intro}</p>
        {isPending ? (
          <div
            role='status'
            aria-busy='true'
            aria-label={loading}
            className='mt-3 flex gap-2 overflow-hidden'
          >
            {Array.from({ length: 5 }, (_, i) => (
              <StreamSkeleton
                key={i}
                className='h-5 w-16 flex-none rounded-md'
              />
            ))}
          </div>
        ) : (
          shown.length > 0 && (
            <section aria-label={copy.technologies} className='mt-3'>
              <ul className='m-0 flex list-none flex-wrap gap-x-3 gap-y-1 p-0'>
                {shown.map((skill) => (
                  <li key={skill.id} className='font-medium text-sm-blue'>
                    <span aria-hidden='true'>#</span>
                    {skill.name}
                  </li>
                ))}
              </ul>
            </section>
          )
        )}
      </div>
    </div>
  );
}
