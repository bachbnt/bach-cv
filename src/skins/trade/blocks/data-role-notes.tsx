/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { ChevronDown } from 'lucide-react';
import { useId } from 'react';
import { resumeCopy } from '@/content/copy/resume';
import type { Doc } from '@/lib/content/schema';
import { formatPeriod } from '@/lib/format';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { cn } from '@/lib/utils';
import { highlighted } from '@/lib/derive/highlighted';
import { isCurrent } from '@/lib/derive/current-job';
import { DataCurrentMark } from '@/skins/trade/blocks/data-current-mark';
import { DataMedia } from '@/skins/trade/blocks/data-media';
import { DataTags } from '@/skins/trade/blocks/data-tags';
import { TvChip } from '@/skins/trade/ui/tv-chip';

/**
 * The notes of the statement: one for each role, which opens to its summary, key project, technologies and responsibilities (the
 * Standard words "Show responsibilities" and "Hide responsibilities" name the button). Shut, the body is `inert` and invisible.
 */
export function DataRoleNotes({
  jobs,
  skills,
  open,
  activeId,
  onToggle,
}: {
  jobs: Doc<'experience'>[];
  skills: Map<string, Doc<'skills'>>;
  open: Set<string>;
  activeId: string | null;
  onToggle: (id: string) => void;
}) {
  return (
    <ol className='m-0 list-none p-0'>
      {jobs.map((job) => (
        <Note
          key={job.id}
          job={job}
          skills={skills}
          open={open.has(job.id)}
          active={job.id === activeId}
          onToggle={() => onToggle(job.id)}
        />
      ))}
    </ol>
  );
}

function Note({
  job,
  skills,
  open,
  active,
  onToggle,
}: {
  job: Doc<'experience'>;
  skills: Map<string, Doc<'skills'>>;
  open: boolean;
  active: boolean;
  onToggle: () => void;
}) {
  const { experience: copy } = useCopy(resumeCopy);
  const { lang } = useLang();
  const bodyId = useId();
  const intro = job.summary || job.tagline;
  const keyProjects = highlighted(job.projects);
  const tags = job.technologies.flatMap((id) => skills.get(id) ?? []);

  return (
    <li
      id={`tv-note-${job.id}`}
      data-job={job.id}
      data-active={active || undefined}
      className='scroll-mt-4 border-b border-tv-line transition-colors data-active:bg-tv-hover/60'
    >
      <div className='flex flex-wrap items-center gap-x-4 gap-y-1 px-3.5 py-2.5'>
        <p className='w-[150px] flex-none text-xs text-tv-mute tabular-nums'>
          {formatPeriod(job.startMonth, job.endMonth, lang)}
        </p>
        <div className='min-w-0 flex-1 basis-[220px]'>
          <h3 className='text-[13px] leading-snug font-semibold'>
            {job.company} {isCurrent(job) && <DataCurrentMark />}
          </h3>
          <p className='text-xs'>
            {job.role}
            {job.team && <span className='text-tv-mute'> · {job.team}</span>}
          </p>
        </div>
        <button
          type='button'
          aria-expanded={open}
          aria-controls={bodyId}
          onClick={onToggle}
          className='inline-flex min-h-8 cursor-pointer items-center gap-1.5 rounded px-1.5 text-[13px] font-medium text-tv-accent-ink transition-colors hover:bg-tv-hover active:bg-tv-hover pointer-coarse:min-h-11'
        >
          {open ? copy.hide : copy.show}
          <ChevronDown
            aria-hidden='true'
            className={cn(
              'size-3.5 transition-transform duration-300',
              open && 'rotate-180',
            )}
          />
        </button>
      </div>
      <div
        id={bodyId}
        data-open={open}
        inert={!open}
        className='grid grid-rows-[0fr] transition-[grid-template-rows,visibility] duration-300 ease-out data-[open=false]:invisible data-[open=true]:grid-rows-[1fr]'
      >
        <div className='overflow-hidden'>
          <div className='grid gap-x-5 gap-y-3 px-3.5 pb-4 min-[901px]:grid-cols-[minmax(0,1fr)_240px] min-[901px]:pl-[182px]'>
            <DataMedia
              id={`job:${job.id}`}
              name={job.company}
              ratio='video'
              sizes='(min-width: 901px) 240px, 100vw'
              className='min-[901px]:col-start-2 min-[901px]:row-start-1'
            />
            <div className='grid min-w-0 content-start gap-3 min-[901px]:col-start-1 min-[901px]:row-start-1'>
              {intro && (
                <p className='max-w-[680px] text-[13px]/[1.55]'>{intro}</p>
              )}
              {keyProjects.map((project) => (
                <div
                  key={project.name}
                  className='max-w-[680px] rounded border border-tv-line bg-tv-panel px-3 py-2.5'
                >
                  <TvChip tone='accent'>{copy.keyProject}</TvChip>
                  <h4 className='mt-1.5 text-[13px] font-semibold'>
                    {project.name}
                  </h4>
                  {project.description && (
                    <p className='mt-0.5 text-xs/[1.5] text-tv-mute'>
                      {project.description}
                    </p>
                  )}
                </div>
              ))}
              <DataTags skills={tags} />
              {job.bullets.length > 0 && (
                <ul className='m-0 flex max-w-[680px] list-disc flex-col gap-1.5 pl-4 text-[13px]/[1.55] text-tv-ink marker:text-tv-dim'>
                  {job.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}
