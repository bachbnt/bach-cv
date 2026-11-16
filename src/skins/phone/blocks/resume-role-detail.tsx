/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { ChevronLeft } from 'lucide-react';
import type { Ref } from 'react';
import { cvCopy } from '@/content/copy/cv';
import { phoneHomeCopy } from '@/content/copy/phone-home';
import { resumeCopy } from '@/content/copy/resume';
import { useNow } from '@/hooks/use-now';
import type { Doc } from '@/lib/content/schema';
import { isCurrent } from '@/lib/derive/current-job';
import { lengthLabel } from '@/lib/derive/duration-label';
import { jobLength } from '@/lib/derive/career-months';
import { highlighted } from '@/lib/derive/highlighted';
import { formatPeriod } from '@/lib/format';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { FactRow } from '@/skins/phone/blocks/fact-row';
import { ResumeRoleMark } from '@/skins/phone/blocks/resume-role-mark';
import { ResumeTags } from '@/skins/phone/blocks/resume-tags';
import { PhButton } from '@/skins/phone/ui/ph-button';
import { PhCard } from '@/skins/phone/ui/ph-card';
import { PhChip } from '@/skins/phone/ui/ph-chip';

const sub =
  'mb-2.5 text-[13px] font-semibold tracking-[0.06em] text-ph-mute uppercase';

/**
 * One role in full: the company, the role and the team, when it was and for how long, the summary, the key project, the technologies and
 * the responsibilities (Standard's row, all open). On a phone it is a screen of its own with the way back to the roles at its top.
 */
export function ResumeRoleDetail({
  job,
  skills,
  onBack,
  detailRef,
}: {
  job: Doc<'experience'>;
  skills: Map<string, Doc<'skills'>>;
  onBack: () => void;
  detailRef: Ref<HTMLDivElement>;
}) {
  const { experience } = useCopy(resumeCopy);
  const words = useCopy(phoneHomeCopy).resume;
  const { labels } = useCopy(cvCopy);
  const { lang } = useLang();
  const now = useNow();
  const intro = job.summary || job.tagline;
  const keyProjects = highlighted(job.projects);

  return (
    <div
      ref={detailRef}
      id='ph-role-detail'
      tabIndex={-1}
      className='scroll-mt-2 outline-none'
    >
      <PhButton
        variant='ghost'
        size='sm'
        className='-ml-2 mb-3 @min-[900px]:hidden'
        onClick={onBack}
      >
        <ChevronLeft aria-hidden='true' className='-ml-1 size-5' />
        {words.backToRoles}
      </PhButton>
      <PhCard className='p-5'>
        <div className='flex items-center gap-4'>
          <ResumeRoleMark job={job} className='size-16 rounded-ph-inner' />
          <div className='min-w-0'>
            <h3 className='text-[22px]/[1.2] font-bold tracking-[-0.01em] [overflow-wrap:anywhere]'>
              {job.company}
            </h3>
            <p className='mt-1 text-[16px]/[1.4] [overflow-wrap:anywhere]'>
              {job.role}
            </p>
            {isCurrent(job) && (
              <PhChip tone='ok' className='mt-2'>
                {experience.current}
              </PhChip>
            )}
          </div>
        </div>
        <dl className='m-0 mt-5 overflow-hidden rounded-ph-inner bg-ph-sheet'>
          <FactRow label={words.detail.period}>
            {formatPeriod(job.startMonth, job.endMonth, lang)}
          </FactRow>
          <FactRow label={words.detail.length}>
            {lengthLabel(jobLength(job, now), words)}
          </FactRow>
          {job.team && <FactRow label={words.detail.team}>{job.team}</FactRow>}
        </dl>
        {intro && (
          <p className='mt-5 text-[16px]/[1.65] [overflow-wrap:anywhere]'>
            {intro}
          </p>
        )}
        {keyProjects.map((project) => (
          <div
            key={project.name}
            className='mt-5 rounded-ph-inner bg-ph-sheet p-4'
          >
            <PhChip tone='accent' className='mb-2'>
              {experience.keyProject}
            </PhChip>
            <h4 className='text-[16px]/[1.35] font-semibold'>{project.name}</h4>
            {project.description && (
              <p className='mt-1 text-[15px]/[1.6] text-ph-mute'>
                {project.description}
              </p>
            )}
          </div>
        ))}
        {job.technologies.some((id) => skills.has(id)) && (
          <div className='mt-6'>
            <h4 className={sub}>{labels.technologies}</h4>
            <ResumeTags ids={job.technologies} skills={skills} />
          </div>
        )}
        {job.bullets.length > 0 && (
          <div className='mt-6'>
            <h4 className={sub}>{labels.responsibilities}</h4>
            <ul className='m-0 flex list-disc flex-col gap-2.5 pl-5 text-[16px]/[1.6] marker:text-ph-accent'>
              {job.bullets.map((bullet) => (
                <li key={bullet} className='[overflow-wrap:anywhere]'>
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
        )}
      </PhCard>
    </div>
  );
}
