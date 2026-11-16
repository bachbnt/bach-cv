/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { BookOpen, CalendarDays } from 'lucide-react';
import Image from 'next/image';
import { useSkills } from '@/components/skills/use-skills';
import { resumeCopy } from '@/content/copy/resume';
import { formatPeriod } from '@/lib/format';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { useContentQuery } from '@/lib/query/use-content';
import { useScreenSizes } from '@/skins/phone/blocks/use-screen-sizes';
import { ResumeTags } from '@/skins/phone/blocks/resume-tags';
import { PhCard } from '@/skins/phone/ui/ph-card';
import { PhChip } from '@/skins/phone/ui/ph-chip';
import { RESUME_CARDS_GRID } from '@/skins/phone/blocks/resume-layout';
import { ResumeEducationSkeleton } from '@/skins/phone/blocks/resume-education-skeleton';
import { PhDataState } from '@/skins/phone/ui/ph-data-state';
import { PhSection } from '@/skins/phone/ui/ph-section';

const link =
  'inline-flex min-h-11 items-center text-[15px] font-semibold text-ph-accent-ink underline underline-offset-4';

/** The Education section: a card for each degree with its photo, school, period and major, and the thesis with its technologies and links. */
export function ResumeEducation() {
  const { education: copy } = useCopy(resumeCopy);
  const { lang } = useLang();
  const { byId } = useSkills();
  const query = useContentQuery('education');
  const degrees = query.data ?? [];
  const sizes = useScreenSizes(520, 1, 0);

  return (
    <PhSection title={copy.title}>
      <PhDataState
        query={query}
        count={degrees.length}
        empty='education'
        subject='education'
        level={3}
        skeleton={<ResumeEducationSkeleton />}
      >
        <div className={RESUME_CARDS_GRID}>
          {degrees.map((degree) => (
            <PhCard key={degree.id} className='overflow-hidden p-0'>
              {degree.logo && (
                <div className='relative aspect-[16/9] w-full bg-ph-sheet-3'>
                  <Image
                    src={degree.logo}
                    alt={`${degree.degree}, ${degree.school}`}
                    fill
                    sizes={sizes}
                    className='object-cover object-[50%_22%]'
                  />
                </div>
              )}
              <div className='p-5'>
                <h3 className='text-[20px]/[1.25] font-bold tracking-[-0.01em]'>
                  {degree.degree}
                </h3>
                <p className='mt-1 text-[15px]/[1.45] text-ph-mute'>
                  {degree.school}
                </p>
                <ul className='m-0 mt-3 flex list-none flex-col gap-1.5 p-0 text-[15px]/[1.4]'>
                  <li className='flex items-center gap-2'>
                    <CalendarDays
                      aria-hidden='true'
                      className='size-4 shrink-0 text-ph-accent-ink'
                    />
                    {formatPeriod(degree.startMonth, degree.endMonth, lang)}
                  </li>
                  {degree.major && (
                    <li className='flex items-center gap-2'>
                      <BookOpen
                        aria-hidden='true'
                        className='size-4 shrink-0 text-ph-accent-ink'
                      />
                      {degree.major}
                    </li>
                  )}
                </ul>
                {degree.thesisTitle && (
                  <div className='mt-4 rounded-ph-inner bg-ph-sheet p-4'>
                    <PhChip tone='accent'>{copy.thesis}</PhChip>
                    <p className='mt-2 text-[16px]/[1.45] font-semibold [overflow-wrap:anywhere]'>
                      {degree.thesisTitle}
                    </p>
                    <ResumeTags
                      ids={degree.technologies}
                      skills={byId}
                      className='mt-3'
                    />
                    {(degree.thesisUrl || degree.thesisSourceUrl) && (
                      <div className='mt-2 flex flex-wrap gap-x-5'>
                        {[
                          [degree.thesisUrl, copy.readThesis],
                          [degree.thesisSourceUrl, copy.sourceCode],
                        ].map(
                          ([href, label]) =>
                            href && (
                              <a
                                key={label}
                                href={href}
                                target='_blank'
                                rel='noopener'
                                className={link}
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
            </PhCard>
          ))}
        </div>
      </PhDataState>
    </PhSection>
  );
}
