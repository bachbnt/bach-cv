/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { BookOpen, CalendarDays } from 'lucide-react';
import Image from 'next/image';
import { useSkills } from '@/components/skills/use-skills';
import { mobaResumeCopy } from '@/content/copy/moba-resume';
import { resumeCopy } from '@/content/copy/resume';
import { formatPeriod } from '@/lib/format';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { useContentQuery } from '@/lib/query/use-content';
import { ResumeTags } from '@/skins/moba/blocks/resume-tags';
import { MbCard } from '@/skins/moba/ui/mb-card';
import { MbChip } from '@/skins/moba/ui/mb-chip';
import { MbDataState } from '@/skins/moba/ui/mb-data-state';
import { MbSection } from '@/skins/moba/ui/mb-section';
import { MbSkeleton } from '@/skins/moba/ui/mb-skeleton';

/** Education: a plaque for each degree with its picture, school, period and major, and the thesis with its technologies and links. */
export function ResumeEducation() {
  const copy = useCopy(resumeCopy);
  const mb = useCopy(mobaResumeCopy);
  const { lang } = useLang();
  const { byId } = useSkills();
  const query = useContentQuery('education');
  const degrees = query.data ?? [];
  return (
    <MbSection
      id='education'
      kicker={mb.kickers.education}
      title={copy.education.title}
      order={3}
      className='pb-10'
    >
      <MbDataState
        query={query}
        count={degrees.length}
        empty='education'
        subject='education'
        level={3}
        skeleton={
          <div className='grid gap-3 min-[720px]:grid-cols-2'>
            {[0, 1].map((i) => (
              <MbSkeleton key={i} className='h-[360px]' />
            ))}
          </div>
        }
      >
        <ul className='m-0 grid list-none gap-3 p-0 min-[720px]:grid-cols-2'>
          {degrees.map((degree) => (
            <li key={degree.id}>
              <MbCard className='flex h-full flex-col overflow-hidden'>
                <article className='flex h-full flex-col'>
                  {degree.logo && (
                    <div className='relative h-[150px] w-full flex-none overflow-hidden bg-mb-well'>
                      <Image
                        src={degree.logo}
                        alt={`${degree.degree}, ${degree.school}`}
                        fill
                        sizes='(min-width: 720px) 380px, 100vw'
                        className='object-cover object-[50%_22%]'
                      />
                    </div>
                  )}
                  <div className='flex flex-1 flex-col gap-2.5 px-5 py-4 max-[719px]:px-4'>
                    <h3 className='text-[22px] leading-[1.15] text-mb-title'>
                      {degree.degree}
                    </h3>
                    <p className='text-[15px] text-mb-mute'>{degree.school}</p>
                    <ul className='m-0 flex list-none flex-wrap gap-x-5 gap-y-1.5 p-0 text-[14px] text-mb-ink/90'>
                      <li className='flex items-center gap-2'>
                        <CalendarDays
                          aria-hidden='true'
                          className='size-4 flex-none text-mb-teal-ink'
                        />
                        <span>
                          {formatPeriod(
                            degree.startMonth,
                            degree.endMonth,
                            lang,
                          )}
                        </span>
                      </li>
                      {degree.major && (
                        <li className='flex items-center gap-2'>
                          <BookOpen
                            aria-hidden='true'
                            className='size-4 flex-none text-mb-teal-ink'
                          />
                          <span>{degree.major}</span>
                        </li>
                      )}
                    </ul>
                    {degree.thesisTitle && (
                      <div className='mt-1 flex flex-col items-start gap-2.5 border-l-[3px] border-mb-teal bg-mb-well/70 px-3.5 py-3'>
                        <MbChip tone='gold'>{copy.education.thesis}</MbChip>
                        <p className='text-[15px] leading-[1.4] font-semibold text-mb-ink'>
                          {degree.thesisTitle}
                        </p>
                        <ResumeTags ids={degree.technologies} skills={byId} />
                        {(degree.thesisUrl || degree.thesisSourceUrl) && (
                          <div className='flex flex-wrap gap-x-5 gap-y-1'>
                            {[
                              [degree.thesisUrl, copy.education.readThesis],
                              [
                                degree.thesisSourceUrl,
                                copy.education.sourceCode,
                              ],
                            ].map(
                              ([href, label]) =>
                                href && (
                                  <a
                                    key={label}
                                    href={href}
                                    target='_blank'
                                    rel='noopener'
                                    className='inline-flex min-h-9 items-center text-[14px] font-bold text-mb-gold-ink underline underline-offset-4 hover:text-mb-gold-lo dark:hover:text-mb-title pointer-coarse:min-h-11'
                                  >
                                    {label}
                                  </a>
                                ),
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </article>
              </MbCard>
            </li>
          ))}
        </ul>
      </MbDataState>
    </MbSection>
  );
}
