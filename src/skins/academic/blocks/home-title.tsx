/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { academicHomeAboutCopy } from '@/content/copy/academic-home-about';
import { homeCopy } from '@/content/copy/home';
import { fill } from '@/lib/chat/fill';
import { shell } from '@/lib/content/shell';
import { currentJob } from '@/lib/derive/current-job';
import { formatMonth } from '@/lib/format';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { useContentQuery } from '@/lib/query/use-content';
import { HomeAskButton } from '@/skins/academic/blocks/home-ask-button';
import { HomeCvButton } from '@/skins/academic/blocks/home-cv-button';
import { HomePolaroid } from '@/skins/academic/blocks/home-polaroid';
import { AcNoteCap, AcRow } from '@/skins/academic/ui/ac-note';

/**
 * The title page: the sentence that says what I do, in chalk, the two buttons (the CV and the chat), and my portrait taped beside them.
 * In the margin, the role that is not over: its title, its company and the month it began (read from the roles, so it is never invented).
 */
export function HomeTitle() {
  const copy = useCopy(homeCopy);
  const mine = useCopy(academicHomeAboutCopy).home;
  const { lang } = useLang();
  const { data: jobs = [] } = useContentQuery('experience');
  const current = currentJob(jobs);

  return (
    <AcRow
      tone='d'
      note={
        current && (
          <>
            <span className='ac-line inline-block pb-1.5 font-ac-chalk text-[28px]/[1.1] [--ul:currentColor] [--ac-line-h:8px] [--ac-line-y:0px]'>
              <span aria-hidden='true'>∴ </span>
              {mine.currentRole}
            </span>
            <AcNoteCap>
              {current.role}, {current.company}
            </AcNoteCap>
            <AcNoteCap>
              {fill(mine.since, {
                month: formatMonth(current.startMonth, lang),
              })}
            </AcNoteCap>
          </>
        )
      }
    >
      <div className='flex flex-wrap items-start gap-x-10 gap-y-8'>
        <div className='min-w-0 flex-[1_1_300px]'>
          <h1 className='ac-line ac-glow inline font-ac-chalk text-[clamp(32px,4vw,52px)]/[1.12] font-normal [--ul:var(--ac-accent)] [--ac-line-h:10px] [--ac-line-y:-4px]'>
            {copy.title}
          </h1>
          <div className='mt-9 flex flex-wrap items-center gap-3'>
            <HomeCvButton />
            <HomeAskButton />
          </div>
        </div>
        {shell.avatar && (
          <HomePolaroid
            src={shell.avatar}
            alt={fill(copy.avatarAlt, { name: shell.name })}
            caption={shell.name}
            aspect='aspect-[4/5]'
            tilt={2}
            sizes='(min-width: 900px) 190px, 70vw'
            priority
            className='w-[min(100%,190px)] flex-none'
          />
        )}
      </div>
    </AcRow>
  );
}
