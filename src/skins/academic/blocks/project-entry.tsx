/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import {
  linkLabel,
  screenshotsLabel,
  skillsOf,
} from '@/components/projects/project-helpers';
import { academicProjectsCopy } from '@/content/copy/academic-projects';
import { projectsCopy } from '@/content/copy/projects';
import type { Doc } from '@/lib/content/schema';
import { formatPeriod } from '@/lib/format';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { cn } from '@/lib/utils';
import { ProjectCover } from '@/skins/academic/blocks/project-cover';
import { AcButton } from '@/skins/academic/ui/ac-button';
import { AcNoteBig, AcNoteCap, AcRow } from '@/skins/academic/ui/ac-note';
import { AcIcon } from '@/skins/academic/ui/ac-icon';

/** The colour of a technology is the chalk of its category, as the tags of Standard are tinted by it. */
const TONE: Record<Doc<'skills'>['category'], string> = {
  mobile: 'text-ac-mc',
  web: 'text-ac-ma',
  ai: 'text-ac-mb',
  tools: 'text-ac-md',
};

/**
 * One project as an entry of the bibliography: its number, name, kind and summary, what it is built with and its links on the left; on the right
 * its cover as a numbered figure and the button for its screenshots. A featured entry (the Featured section) also has its note in the margin.
 */
export function ProjectEntry({
  project,
  number,
  skills,
  featured = false,
  onOpenScreenshots,
}: {
  project: Doc<'projects'>;
  /** its place in the list of all projects, kept when the list is filtered, like the number of a reference */
  number: number;
  skills: Map<string, Doc<'skills'>>;
  /** the entry of the Featured section (with its margin note); in the list of all projects the featured ones carry a tag instead */
  featured?: boolean;
  onOpenScreenshots: (project: Doc<'projects'>) => void;
}) {
  const copy = useCopy(projectsCopy);
  const own = useCopy(academicProjectsCopy);
  const { lang } = useLang();
  const tags = skillsOf(project.technologies, skills);
  const hasImages = project.images.length > 0;
  const isFeatured = project.highlight !== null;

  const note = featured ? (
    <>
      <AcNoteBig>{copy.featuredTag}</AcNoteBig>
      {project.startMonth && (
        <AcNoteCap>
          {formatPeriod(project.startMonth, project.endMonth, lang)}
        </AcNoteCap>
      )}
    </>
  ) : undefined;

  return (
    <AcRow note={note} tone='c'>
      <article
        id={featured ? undefined : `ref-p-${project.id}`}
        tabIndex={featured ? undefined : -1}
        className={cn(
          'grid min-w-0 gap-x-6 gap-y-2 outline-none min-[900px]:grid-cols-[minmax(0,1fr)_184px]',
          // without a note the entry keeps out of the margin all the same, so the ruled line never runs through a text
          !note && 'min-[900px]:pr-[308px]',
        )}
      >
        <div className='min-w-0'>
          <h3 className='ac-glow font-ac-chalk text-[31px]/[1.12] font-normal wrap-anywhere'>
            <span
              aria-hidden='true'
              className='mr-2.5 inline-block min-w-[1.5em] rounded-[52%_46%_55%_44%/46%_54%_44%_55%] border-[1.8px] border-ac-accent px-[0.28em] text-center font-ac-note text-[0.6em]/[1.32] text-ac-accent'
            >
              {number}
            </span>
            {project.name}
            {!featured && isFeatured && (
              <span
                aria-hidden='true'
                className='ml-1.5 text-[0.7em] text-ac-mute'
              >
                †
              </span>
            )}
          </h3>
          <p className='mt-1 mb-2 flex flex-wrap items-center gap-2 font-ac-note text-[16.5px] text-ac-mute'>
            <span>{copy.kinds[project.kind]}</span>
            {!featured && isFeatured && (
              <span className='rounded-[12px_9px_11px_10px/10px_11px_9px_12px] border-[1.5px] border-ac-rule px-2 text-[14px]'>
                {copy.featuredTag}
              </span>
            )}
          </p>
          {project.summary && (
            <p className='my-2 text-pretty'>{project.summary}</p>
          )}
          {tags.length > 0 && (
            <div className='my-2 flex flex-wrap items-baseline gap-x-2 text-[0.95em]'>
              <b className='font-ac-note text-[1.04em] font-normal text-ac-md'>
                {own.builtWith}
              </b>
              <ul
                aria-label={copy.technologies}
                className='m-0 flex list-none flex-wrap gap-x-2 p-0'
              >
                {tags.map((skill, i) => (
                  <li
                    key={skill.id}
                    className={cn(
                      TONE[skill.category],
                      i > 0 &&
                        "before:mr-2 before:text-ac-mute before:content-['·']",
                    )}
                  >
                    {skill.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {project.links.length > 0 && (
            <p className='my-2 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-[0.95em]'>
              <b className='font-ac-note text-[1.04em] font-normal text-ac-md'>
                {own.links}
              </b>
              {project.links.map((link) => {
                const external = /^https?:\/\//.test(link.url);
                return (
                  <a
                    key={link.url}
                    href={link.url}
                    target={external ? '_blank' : undefined}
                    rel={external ? 'noopener noreferrer' : undefined}
                    className='text-ac-link underline decoration-[1.6px] underline-offset-[3px]'
                  >
                    {linkLabel(link, copy.links)}
                    {external && (
                      <AcIcon name='external' className='ml-1 inline' />
                    )}
                  </a>
                );
              })}
            </p>
          )}
        </div>
        <div className='min-w-0'>
          <ProjectCover
            project={project}
            firstSkill={tags[0]}
            number={number}
            taped={isFeatured}
            onOpen={hasImages ? () => onOpenScreenshots(project) : undefined}
          />
          {hasImages && (
            <AcButton
              variant='quiet'
              size='sm'
              className='mt-2.5'
              onClick={() => onOpenScreenshots(project)}
            >
              {screenshotsLabel(project.images.length, copy)}
            </AcButton>
          )}
        </div>
      </article>
    </AcRow>
  );
}
