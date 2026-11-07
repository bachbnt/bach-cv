/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import {
  Briefcase,
  Building2,
  ExternalLink,
  GraduationCap,
  User,
  type LucideIcon,
} from 'lucide-react';
import { useId, useRef, useState } from 'react';
import { linkLabel, skillsOf } from '@/components/projects/project-helpers';
import { projectsCopy } from '@/content/copy/projects';
import { travelPostcardsCopy } from '@/content/copy/travel-postcards';
import type { Doc } from '@/lib/content/schema';
import { formatPeriod } from '@/lib/format';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { cn } from '@/lib/utils';
import { PostcardCover } from '@/skins/travel/blocks/postcard-cover';
import {
  STOP_OF_CATEGORY,
  stopClass,
  tiltClass,
} from '@/skins/travel/blocks/postcard-model';
import { useClamped } from '@/skins/travel/blocks/use-clamped';

/** The picture inside the round stamp: what kind of trip the project was. */
const KIND_ICON: Record<Doc<'projects'>['kind'], LucideIcon> = {
  personal: User,
  freelance: Briefcase,
  company: Building2,
  academic: GraduationCap,
};

const tag = 'inline-flex rounded-full px-2.5 py-0.5 text-[11.5px] font-bold';

/**
 * One project as a photo postcard: the picture (a button to its screenshots), a round stamp, the kind and featured tags, name,
 * summary (cut to three lines, with Read more when it is longer), technologies, the period as the postmark and the links.
 */
export function Postcard({
  project,
  skills,
  index,
  onOpenScreenshots,
}: {
  project: Doc<'projects'>;
  skills: Map<string, Doc<'skills'>>;
  index: number;
  onOpenScreenshots: (project: Doc<'projects'>) => void;
}) {
  const copy = useCopy(projectsCopy);
  const words = useCopy(travelPostcardsCopy).projects;
  const { lang } = useLang();
  const tags = skillsOf(project.technologies, skills);
  const KindIcon = KIND_ICON[project.kind];
  const summaryId = useId();
  const summary = useRef<HTMLParagraphElement>(null);
  const [open, setOpen] = useState(false);
  const clamped = useClamped(summary, !open, project.summary);
  const period = project.startMonth
    ? formatPeriod(project.startMonth, project.endMonth, lang)
    : '';

  return (
    <article
      data-testid='project'
      className={cn(
        tiltClass(index),
        'tl-postcard flex w-full flex-col gap-2.5 rounded-xl border border-black/5 bg-tl-paper p-2.5 pb-3 text-tl-paper-ink shadow-[0_12px_24px_-10px_rgba(0,0,0,0.45)] md:w-[262px] md:flex-none',
      )}
    >
      <div className='relative'>
        <PostcardCover
          project={project}
          firstSkill={tags[0]}
          onOpen={() => onOpenScreenshots(project)}
        />
        <span
          aria-hidden='true'
          className='pointer-events-none absolute top-2 right-2 grid size-11 rotate-12 place-items-center rounded-full border-2 border-dashed border-tl-paper-hot-ink bg-tl-paper text-tl-paper-hot-ink shadow-[0_2px_8px_rgba(0,0,0,0.2)]'
        >
          <KindIcon className='size-5' strokeWidth={2.2} />
        </span>
      </div>
      <div className='flex flex-wrap items-center gap-1.5'>
        <span className={cn(tag, 'bg-tl-paper-tag text-tl-paper-tag-ink')}>
          {copy.kinds[project.kind]}
        </span>
        {project.highlight !== null && (
          <span className={cn(tag, 'bg-tl-paper-hot text-tl-paper-hot-ink')}>
            {copy.featuredTag}
          </span>
        )}
      </div>
      <h2 className='m-0 text-[17px] leading-[1.2] font-extrabold'>
        {project.name}
      </h2>
      {project.summary && (
        <div className='-mt-1'>
          <p
            ref={summary}
            id={summaryId}
            className={cn(
              'm-0 text-[13px] leading-[1.5] text-tl-paper-muted',
              !open && 'line-clamp-3',
            )}
          >
            {project.summary}
          </p>
          {(clamped || open) && (
            <button
              type='button'
              aria-expanded={open}
              aria-controls={summaryId}
              onClick={() => setOpen((v) => !v)}
              className='mt-0.5 inline-flex cursor-pointer items-center text-[12.5px] font-bold text-tl-paper-hot-ink underline underline-offset-2 pointer-coarse:min-h-11'
            >
              {open ? words.readLess : words.readMore}
            </button>
          )}
        </div>
      )}
      {tags.length > 0 && (
        <ul
          aria-label={copy.technologies}
          className='m-0 flex list-none flex-wrap gap-1.5 p-0'
        >
          {tags.map((skill) => (
            <li
              key={skill.id}
              className={cn(
                stopClass(STOP_OF_CATEGORY[skill.category]),
                tag,
                'items-center gap-1.5 border border-[color-mix(in_srgb,var(--tl-pc)_45%,transparent)] bg-[color-mix(in_srgb,var(--tl-pc)_14%,var(--tl-paper))] font-semibold text-tl-paper-ink before:size-1.5 before:rotate-45 before:rounded-[2px] before:bg-[var(--tl-pc)] before:content-[""]',
              )}
            >
              {skill.name}
            </li>
          ))}
        </ul>
      )}
      {(period || project.links.length > 0) && (
        <div className='mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-dashed border-tl-paper-line pt-2'>
          {period && (
            <span className='text-[11px] font-semibold tracking-[0.3px] text-tl-paper-muted'>
              <span className='sr-only'>{words.postmark}: </span>
              {period}
            </span>
          )}
          {project.links.length > 0 && (
            <span className='ml-auto flex flex-wrap justify-end gap-x-3'>
              {project.links.map((link) => {
                const external = /^https?:\/\//.test(link.url);
                return (
                  <a
                    key={link.url}
                    href={link.url}
                    target={external ? '_blank' : undefined}
                    rel={external ? 'noopener noreferrer' : undefined}
                    className='inline-flex items-center gap-1 py-1 text-[12.5px] font-bold text-tl-paper-tag-ink underline underline-offset-2 pointer-coarse:min-h-11'
                  >
                    {linkLabel(link, copy.links)}
                    {external && (
                      <ExternalLink aria-hidden='true' className='size-3' />
                    )}
                  </a>
                );
              })}
            </span>
          )}
        </div>
      )}
    </article>
  );
}
