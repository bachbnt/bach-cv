/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { kindsPresent } from '@/components/projects/project-helpers';
import { projectsCopy } from '@/content/copy/projects';
import { travelPostcardsCopy } from '@/content/copy/travel-postcards';
import type { Doc } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { useContentQuery } from '@/lib/query/use-content';
import { FilterChip } from '@/skins/travel/blocks/filter-chip';
import { Postcard } from '@/skins/travel/blocks/postcard';
import { useScreenshotsDialog } from '@/skins/travel/blocks/use-screenshots-dialog';
import { useReducedMotion } from '@/skins/travel/shell/use-reduced-motion';
import { TlButton } from '@/skins/travel/ui/tl-button';
import { TlDataState } from '@/skins/travel/ui/tl-data-state';
import { TlKicker } from '@/skins/travel/ui/tl-card';
import { TlSkeleton } from '@/skins/travel/ui/tl-skeleton';

/** The page's heading id: the panel is named by it. */
export const PROJECTS_TITLE_ID = 'tl-projects-title';

/** Three postcards' worth of grey while the projects load (same size as a postcard, so nothing jumps). */
function PostcardsSkeleton() {
  return (
    <div className='flex flex-col gap-4 md:flex-row md:overflow-hidden'>
      {[0, 1, 2].map((i) => (
        <TlSkeleton
          key={i}
          className='h-[330px] w-full rounded-xl md:w-[262px] md:flex-none'
        />
      ))}
    </div>
  );
}

/**
 * The Projects page body: the heading, the kind filter (as Standard: All plus each kind that has a project), and the postcards in a
 * strip that scrolls sideways (a column on a phone). Featured projects come first, in rank order, and wear a Featured tag.
 */
export function PostcardsStrip() {
  const copy = useCopy(projectsCopy);
  const words = useCopy(travelPostcardsCopy).projects;
  const reduced = useReducedMotion();
  const projectsQuery = useContentQuery('projects', { featuredFirst: true });
  const { data: skillList = [] } = useContentQuery('skills');
  const skills = useMemo(
    () => new Map(skillList.map((s) => [s.id, s])),
    [skillList],
  );
  const [openScreenshots, dialog] = useScreenshotsDialog();
  const [filter, setFilter] = useState<'all' | Doc<'projects'>['kind']>('all');
  const strip = useRef<HTMLUListElement>(null);

  const projects = projectsQuery.data ?? [];
  const kinds = kindsPresent(projects);
  const shown =
    filter === 'all' ? projects : projects.filter((p) => p.kind === filter);

  const scroll = (direction: -1 | 1) => {
    const el = strip.current;
    if (!el) return;
    el.scrollBy({
      left: direction * el.clientWidth * 0.8,
      behavior: reduced ? 'auto' : 'smooth',
    });
  };

  return (
    <div className='flex flex-col gap-3 px-4 pt-1 pb-4 md:px-5 md:pt-4 md:pb-3'>
      <header className='flex flex-wrap items-end justify-between gap-x-6 gap-y-3'>
        <div className='min-w-0'>
          <TlKicker>{words.kicker}</TlKicker>
          <h1
            id={PROJECTS_TITLE_ID}
            className='m-0 text-[22px] leading-[1.15] font-extrabold'
          >
            {copy.title}
          </h1>
          <p className='m-0 mt-0.5 max-w-[60ch] text-[13px] text-tl-muted'>
            {copy.intro}
          </p>
        </div>
        <div className='flex flex-wrap items-center gap-2'>
          {kinds.length > 1 && (
            <div
              role='group'
              aria-label={copy.filterLabel}
              className='flex flex-wrap gap-1.5'
            >
              {(['all', ...kinds] as const).map((value) => (
                <FilterChip
                  key={value}
                  pressed={filter === value}
                  onClick={() => setFilter(value)}
                >
                  {value === 'all' ? copy.filterAll : copy.kinds[value]}
                </FilterChip>
              ))}
            </div>
          )}
          {shown.length > 0 && (
            <div className='hidden gap-1.5 md:flex'>
              <TlButton
                variant='ghost'
                size='icon'
                aria-label={words.scrollLeft}
                onClick={() => scroll(-1)}
              >
                <ChevronLeft aria-hidden='true' />
              </TlButton>
              <TlButton
                variant='ghost'
                size='icon'
                aria-label={words.scrollRight}
                onClick={() => scroll(1)}
              >
                <ChevronRight aria-hidden='true' />
              </TlButton>
            </div>
          )}
        </div>
      </header>
      <TlDataState
        query={projectsQuery}
        count={projects.length}
        empty='projects'
        subject='projects'
        skeleton={<PostcardsSkeleton />}
        level={2}
      >
        {/* a filter swaps the strip: the new postcards rise in from the start of the strip */}
        <ul
          key={filter}
          ref={strip}
          aria-label={words.postcardsLabel}
          className='tl-rise m-0 flex list-none snap-x snap-proximity flex-col gap-4 p-0 md:-mx-2 md:flex-row md:scroll-px-2 md:overflow-x-auto md:[scrollbar-width:thin] md:px-2 md:pt-4 md:pb-4'
        >
          {shown.map((project, index) => (
            <li key={project.id} className='snap-start md:flex md:flex-none'>
              <Postcard
                project={project}
                skills={skills}
                index={index}
                onOpenScreenshots={openScreenshots}
              />
            </li>
          ))}
        </ul>
      </TlDataState>
      {dialog}
    </div>
  );
}
