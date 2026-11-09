/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { resumeCopy } from '@/content/copy/resume';
import { useSkills } from '@/components/skills/use-skills';
import type { Doc, Skill } from '@/lib/content/schema';
import { formatPeriod } from '@/lib/format';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { useContentQuery } from '@/lib/query/use-content';
import { ResumePhoto } from '@/skins/academic/blocks/resume-photo';
import { ResumeTags } from '@/skins/academic/blocks/resume-tags';
import { AcDataState } from '@/skins/academic/ui/ac-data-state';
import { AcHeading } from '@/skins/academic/ui/ac-section';
import { AcSkeleton } from '@/skins/academic/ui/ac-skeleton';
import { AcIcon } from '@/skins/academic/ui/ac-icon';

/** One degree: the school's logo, the degree, the school, the period, the major and the thesis with its technologies and links. */
function Degree({
  degree,
  skills,
}: {
  degree: Doc<'education'>;
  skills: Map<string, Skill>;
}) {
  const copy = useCopy(resumeCopy).education;
  const { lang } = useLang();
  const links = [
    [degree.thesisUrl, copy.readThesis],
    [degree.thesisSourceUrl, copy.sourceCode],
  ].filter((link): link is [string, string] => Boolean(link[0]));

  return (
    <article className='grid gap-x-8 gap-y-4 min-[761px]:grid-cols-[minmax(0,220px)_minmax(0,1fr)]'>
      {degree.logo ? (
        <ResumePhoto
          src={degree.logo}
          alt={`${degree.degree}, ${degree.school}`}
        />
      ) : (
        <span aria-hidden='true' className='max-[760px]:hidden' />
      )}
      <div className='min-w-0'>
        <h3 className='font-ac-chalk text-[31px]/[1.1] font-normal'>
          {degree.degree}
        </h3>
        <p className='mt-1 mb-0'>{degree.school}</p>
        <p className='mb-0 font-ac-note text-[17px] text-ac-mute'>
          {formatPeriod(degree.startMonth, degree.endMonth, lang)}
          {degree.major && ` · ${degree.major}`}
        </p>
        {degree.thesisTitle && (
          <div className='mt-4 rounded-[10px_5px_12px_6px/6px_12px_5px_10px] border-2 border-dashed border-ac-rule px-4 pt-3 pb-4'>
            <span className='font-ac-note text-[16px] text-ac-md'>
              {copy.thesis}
            </span>
            <p className='mt-0.5 mb-0 font-semibold'>{degree.thesisTitle}</p>
            <ResumeTags
              ids={degree.technologies}
              skills={skills}
              className='mt-3'
            />
            {links.length > 0 && (
              <p className='mt-3 mb-0 flex flex-wrap gap-x-5 gap-y-1'>
                {links.map(([href, label]) => (
                  <a
                    key={label}
                    href={href}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-flex font-ac-note text-[17px] text-ac-link underline underline-offset-4 pointer-coarse:min-h-11 pointer-coarse:items-center'
                  >
                    {label}
                    <AcIcon name='external' className='ml-1 inline' />
                  </a>
                ))}
              </p>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

/** The Education section: every visible degree, newest first. */
export function ResumeEducation() {
  const copy = useCopy(resumeCopy);
  const query = useContentQuery('education');
  const { byId } = useSkills();
  const degrees = query.data ?? [];
  return (
    <section aria-labelledby='education-h' className='mt-12'>
      <AcHeading id='education-h'>{copy.education.title}</AcHeading>
      <AcDataState
        query={query}
        count={degrees.length}
        empty='education'
        subject='education'
        level={3}
        className='mt-6'
        skeleton={
          <div className='mt-6 grid gap-3'>
            <AcSkeleton className='h-8 w-1/2' />
            <AcSkeleton className='w-2/5' />
            <AcSkeleton className='w-3/5' />
          </div>
        }
      >
        <div className='mt-6 grid gap-10'>
          {degrees.map((degree) => (
            <Degree key={degree.id} degree={degree} skills={byId} />
          ))}
        </div>
      </AcDataState>
    </section>
  );
}
