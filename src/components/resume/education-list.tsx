/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { BookOpen, CalendarDays } from 'lucide-react';
import Image from 'next/image';
import { DataState } from '@/components/data-state';
import { SkillTags } from '@/components/resume/skill-tags';
import { CardsSkeleton } from '@/components/skeletons';
import { useSkills } from '@/components/skills/use-skills';
import { resumeCopy } from '@/content/copy/resume';
import type { Doc } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { formatPeriod } from '@/lib/format';
import { useContentQuery } from '@/lib/query/use-content';

/** Degrees, with the loading, empty and error states of every data block. */
export function EducationList() {
  const query = useContentQuery('education');
  const degrees = query.data ?? [];
  return (
    <DataState
      query={query}
      count={degrees.length}
      empty='education'
      subject='education'
      level={3}
      skeleton={
        <CardsSkeleton
          count={2}
          min={380}
          height={420}
          itemClassName='bg-white'
        />
      }
      className='mt-8'
    >
      <EducationCards degrees={degrees} />
    </DataState>
  );
}

/** Degrees as cards: photo, school, period, major, and the thesis with its technologies and link. */
function EducationCards({ degrees }: { degrees: Doc<'education'>[] }) {
  const { byId } = useSkills();
  const copy = useCopy(resumeCopy).education;
  const { lang } = useLang();

  return (
    <div className='mt-8 grid grid-cols-[repeat(auto-fit,minmax(min(100%,380px),1fr))] gap-6'>
      {degrees.map((degree) => (
        <article
          key={degree.id}
          className='flex flex-col overflow-hidden rounded-2xl border bg-white'
        >
          {degree.logo && (
            <Image
              src={degree.logo}
              alt={`${degree.degree}, ${degree.school}`}
              width={600}
              height={220}
              className='h-[220px] w-full bg-border object-cover object-[50%_22%]'
            />
          )}
          <div className='flex flex-1 flex-col gap-3 p-6'>
            <h3 className='text-2xl leading-[1.15]'>{degree.degree}</h3>
            <p className='text-base text-muted-foreground'>{degree.school}</p>
            <ul className='mt-1 flex list-none flex-wrap gap-x-6 gap-y-2 p-0'>
              <li className='flex items-center gap-2 text-[15px] text-[#3a404c]'>
                <CalendarDays
                  aria-hidden='true'
                  className='size-4 flex-none text-page'
                />
                <span>
                  {formatPeriod(degree.startMonth, degree.endMonth, lang)}
                </span>
              </li>
              {degree.major && (
                <li className='flex items-center gap-2 text-[15px] text-[#3a404c]'>
                  <BookOpen
                    aria-hidden='true'
                    className='size-4 flex-none text-page'
                  />
                  <span>{degree.major}</span>
                </li>
              )}
            </ul>
            {degree.thesisTitle && (
              <div className='mt-2 flex flex-col items-start gap-2 rounded-xl bg-background p-4'>
                <span className='inline-flex items-center rounded-full bg-page-tint px-2.5 py-[3px] text-[13px] font-semibold whitespace-nowrap text-page'>
                  {copy.thesis}
                </span>
                <p className='text-base leading-[1.4] font-semibold'>
                  {degree.thesisTitle}
                </p>
                <SkillTags
                  ids={degree.technologies}
                  skills={byId}
                  className='mt-4'
                />
                {(degree.thesisUrl || degree.thesisSourceUrl) && (
                  <div className='mt-1 flex flex-wrap gap-x-5 gap-y-1.5'>
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
                            className='inline-flex text-[15px] font-semibold underline underline-offset-4 hover:text-brand pointer-coarse:min-h-11 pointer-coarse:items-center'
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
      ))}
    </div>
  );
}
