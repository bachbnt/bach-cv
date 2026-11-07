/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { ListVideo } from 'lucide-react';
import Image from 'next/image';
import { useSkills } from '@/components/skills/use-skills';
import { careerCopy } from '@/content/copy/stream-career';
import { resumeCopy } from '@/content/copy/resume';
import { formatPeriod } from '@/lib/format';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { useContentQuery } from '@/lib/query/use-content';
import { technologiesOf } from '@/skins/stream/blocks/career-job';
import { StreamTag } from '@/skins/stream/ui/stream-chip';
import { StreamDataState } from '@/skins/stream/ui/stream-data-state';
import { StreamHeading } from '@/skins/stream/ui/stream-heading';
import { StreamSkeleton } from '@/skins/stream/ui/stream-skeleton';

/**
 * Education as a playlist: a panel with the name of the section and the degrees as its numbered items, each with the photo as the
 * thumbnail, the degree, the school, the period and the major, and the thesis (with its technologies and links) under it.
 */
export function CareerPlaylist() {
  const copy = useCopy(resumeCopy).education;
  const career = useCopy(careerCopy);
  const { lang } = useLang();
  const { byId } = useSkills();
  const query = useContentQuery('education');
  const degrees = query.data ?? [];

  return (
    <section
      id='education'
      aria-labelledby='education-h'
      className='mt-12 scroll-mt-20 px-3 min-[701px]:px-0'
    >
      <div className='overflow-hidden rounded-xl bg-sm-surface'>
        <div className='flex flex-wrap items-center gap-x-3 gap-y-1 bg-sm-hover px-4 py-3'>
          <StreamHeading id='education-h' className='mb-0'>
            {copy.title}
          </StreamHeading>
          <span className='inline-flex items-center gap-1 text-xs font-medium text-sm-mute'>
            <ListVideo aria-hidden='true' className='size-4' />
            {career.playlist}
          </span>
        </div>
        <StreamDataState
          query={query}
          count={degrees.length}
          empty='education'
          subject='education'
          level={3}
          className='p-4'
          skeleton={
            <div className='flex flex-col gap-3'>
              <StreamSkeleton className='h-24' />
              <StreamSkeleton className='h-24' />
            </div>
          }
        >
          <ol className='m-0 list-none p-0'>
            {degrees.map((degree, index) => {
              const technologies = technologiesOf(degree.technologies, byId);
              return (
                <li
                  key={degree.id}
                  className='flex gap-3 border-t border-sm-line p-3 first:border-t-0 min-[701px]:gap-4 min-[701px]:p-4'
                >
                  <span
                    aria-hidden='true'
                    className='w-5 flex-none pt-1 text-center text-sm text-sm-mute'
                  >
                    {index + 1}
                  </span>
                  <div className='flex min-w-0 flex-1 flex-col gap-3 min-[701px]:flex-row min-[701px]:gap-4'>
                    {degree.logo && (
                      <div className='relative aspect-video w-full flex-none overflow-hidden rounded-lg bg-sm-hover min-[701px]:w-[200px]'>
                        <Image
                          src={degree.logo}
                          alt={`${degree.degree}, ${degree.school}`}
                          fill
                          sizes='(min-width: 701px) 200px, 100vw'
                          className='object-cover object-[50%_22%]'
                        />
                      </div>
                    )}
                    <div className='min-w-0'>
                      <h3 className='text-base/[1.35] font-medium'>
                        {degree.degree}
                      </h3>
                      <p className='text-sm text-sm-mute'>{degree.school}</p>
                      <p className='text-[13px] text-sm-mute'>
                        {formatPeriod(degree.startMonth, degree.endMonth, lang)}
                        {degree.major && ` · ${degree.major}`}
                      </p>
                      {degree.thesisTitle && (
                        <div className='mt-3 rounded-lg bg-sm-hover px-3 py-2.5'>
                          <StreamTag className='bg-sm-hover2'>
                            {copy.thesis}
                          </StreamTag>
                          <p className='mt-1.5 text-sm/[1.4] font-medium'>
                            {degree.thesisTitle}
                          </p>
                          {technologies.length > 0 && (
                            <ul className='m-0 mt-1.5 flex list-none flex-wrap gap-x-3 p-0'>
                              {technologies.map((skill) => (
                                <li
                                  key={skill.id}
                                  className='text-[13px] font-medium text-sm-blue'
                                >
                                  <span aria-hidden='true'>#</span>
                                  {skill.name}
                                </li>
                              ))}
                            </ul>
                          )}
                          {(degree.thesisUrl || degree.thesisSourceUrl) && (
                            <div className='mt-1 flex flex-wrap gap-x-4'>
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
                                      className='text-sm font-medium text-sm-blue hover:underline pointer-coarse:inline-flex pointer-coarse:min-h-11 pointer-coarse:items-center'
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
                  </div>
                </li>
              );
            })}
          </ol>
        </StreamDataState>
      </div>
    </section>
  );
}
