/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { academicResumeCopy } from '@/content/copy/academic-resume';
import { resumeCopy } from '@/content/copy/resume';
import type { Doc, Skill } from '@/lib/content/schema';
import { isCurrent } from '@/lib/derive/current-job';
import { lengthLabel } from '@/lib/derive/duration-label';
import { jobLength } from '@/lib/derive/career-months';
import { highlighted } from '@/lib/derive/highlighted';
import { formatPeriod } from '@/lib/format';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { ResumePhoto } from '@/skins/academic/blocks/resume-photo';
import { ResumeResponsibilities } from '@/skins/academic/blocks/resume-responsibilities';
import { ResumeTags } from '@/skins/academic/blocks/resume-tags';
import { AcNoteBig, AcNoteCap, AcRow } from '@/skins/academic/ui/ac-note';

/**
 * One role as a numbered result of the manuscript: the company, the role, the period, the summary, the key projects, the technologies and
 * the responsibilities; in the margin the logo and how long it lasted (the current role says so). Everything Standard shows for a role.
 */
export function ResumeRole({
  job,
  number,
  skills,
  now,
  open,
}: {
  job: Doc<'experience'>;
  number: number;
  skills: Map<string, Skill>;
  now: Date;
  open: boolean;
}) {
  const { experience: copy } = useCopy(resumeCopy);
  const words = useCopy(academicResumeCopy);
  const { lang } = useLang();
  const current = isCurrent(job);
  const intro = job.summary || job.tagline;
  const keyProjects = highlighted(job.projects);

  const note = (
    <>
      {job.logo && (
        <ResumePhoto
          src={job.logo}
          alt={job.company}
          className='mb-3 max-w-[200px] max-[899px]:max-w-[150px]'
        />
      )}
      <AcNoteBig>{lengthLabel(jobLength(job, now), words)}</AcNoteBig>
      {current && <AcNoteCap>∴ {copy.current}</AcNoteCap>}
    </>
  );

  return (
    <article className='mb-10'>
      <AcRow note={note} tone={current ? 'd' : 'b'} sticky>
        <h3 className='font-ac-chalk text-[33px]/[1.12] font-normal'>
          <span aria-hidden='true' className='mr-2 text-ac-accent'>
            {number}.
          </span>
          {job.company}
          {current && (
            <span className='ml-3 rounded-full border-2 border-ac-accent px-2.5 pt-px pb-0.5 align-middle font-ac-note text-[15px] text-ac-accent'>
              {copy.current}
            </span>
          )}
        </h3>
        <p className='mt-1 font-semibold'>
          {job.role}
          {job.team && (
            <span className='font-normal text-ac-mute'>
              {' · '}
              {job.team}
            </span>
          )}
        </p>
        <p className='font-ac-note text-[17px] text-ac-mute'>
          {formatPeriod(job.startMonth, job.endMonth, lang)}
        </p>
        {intro && <p className='mt-3 mb-0 max-w-[62ch]'>{intro}</p>}
        {keyProjects.map((project) => (
          <div
            key={project.name}
            className='mt-4 border-l-[3px] border-ac-md pl-4'
          >
            <span className='font-ac-note text-[16px] text-ac-md'>
              {copy.keyProject}
            </span>
            <h4 className='font-semibold'>{project.name}</h4>
            {project.description && (
              <p className='mt-0.5 mb-0 text-[0.95em] text-ac-mute'>
                {project.description}
              </p>
            )}
          </div>
        ))}
        <ResumeTags ids={job.technologies} skills={skills} className='mt-4' />
        {job.bullets.length > 0 && (
          <ResumeResponsibilities
            bullets={job.bullets}
            defaultOpen={open}
            show={copy.show}
            hide={copy.hide}
          />
        )}
      </AcRow>
    </article>
  );
}
