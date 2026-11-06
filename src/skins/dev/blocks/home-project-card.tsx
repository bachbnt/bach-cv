/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  fillCopy,
  initialsOf,
  skillsOf,
} from '@/components/projects/project-helpers';
import { projectsCopy } from '@/content/copy/projects';
import type { Doc } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import { DevChip } from '@/skins/dev/ui/dev-chip';

/** the card is a link, so it carries the look of a `DevCard` itself */
const CARD =
  'group/card flex flex-col overflow-hidden rounded-[8px] border border-line-2 bg-chrome transition-[transform,border-color,box-shadow] duration-200 ease-[ease] hover:border-[color:color-mix(in_srgb,var(--dv-accent)_65%,var(--line-2))] hover:shadow-[0_16px_36px_color-mix(in_srgb,var(--dv-accent)_14%,transparent)] hover:[transform:translateY(-3px)]';
/** the initials on a cover that has no picture take the colour of the first technology */
const TILE_TONE: Record<string, string> = {
  none: 'text-mute',
  mobile: 'text-signal',
  web: 'text-sky',
  ai: 'text-fn',
  tools: 'text-field',
};
const SIZES = '(max-width: 900px) 100vw, 360px';

/** One featured project of Home: a card that opens the project's first link, or the Projects page. */
export function HomeProjectCard({
  project,
  skills,
}: {
  project: Doc<'projects'>;
  skills: Map<string, Doc<'skills'>>;
}) {
  const projectsText = useCopy(projectsCopy);
  const tags = skillsOf(project.technologies, skills);
  const href = project.links[0]?.url ?? '/projects';
  const card = (
    <>
      <div className='relative block aspect-[16/10] w-full cursor-pointer overflow-hidden border-b border-line-2 bg-chrome-2'>
        {project.cover ? (
          <Image
            src={project.cover}
            alt={fillCopy(projectsText.coverAlt, {
              name: project.name,
            })}
            fill
            sizes={SIZES}
            loading='lazy'
            className='object-cover object-top transition-transform duration-[600ms] ease-[ease] group-hover/card:scale-[1.04]'
          />
        ) : (
          <span
            aria-hidden='true'
            className={cn(
              'absolute inset-0 grid place-items-center bg-chrome-2 font-code text-[44px] leading-[normal] font-bold tracking-[-0.03em]',
              TILE_TONE[tags[0]?.category ?? 'none'],
            )}
          >
            {initialsOf(project.name)}
          </span>
        )}
      </div>
      <div className='flex flex-1 flex-col px-4 pt-3.5 pb-4'>
        <h3 className='text-[20px] text-sky [overflow-wrap:anywhere]'>
          {project.name}
        </h3>
        {project.summary && (
          <p className='mt-1.5 mb-1 line-clamp-4 text-[14.5px] text-mute'>
            {project.summary}
          </p>
        )}
        {tags.length > 0 && (
          <div className='mt-3 flex flex-wrap gap-[7px]'>
            {tags.map((t) => (
              <DevChip key={t.id} tone={t.category}>
                {t.name}
              </DevChip>
            ))}
          </div>
        )}
      </div>
    </>
  );
  return href.startsWith('/') ? (
    <Link href={href} className={CARD} data-reveal>
      {card}
    </Link>
  ) : (
    <a href={href} className={CARD} data-reveal>
      {card}
    </a>
  );
}
