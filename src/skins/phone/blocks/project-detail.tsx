/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { ChevronLeft, Images } from 'lucide-react';
import Image from 'next/image';
import type { Ref } from 'react';
import {
  screenshotsLabel,
  skillsOf,
} from '@/components/projects/project-helpers';
import { phoneProjectsCopy } from '@/content/copy/phone-projects';
import { projectsCopy } from '@/content/copy/projects';
import { fill } from '@/lib/chat/fill';
import type { Doc } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import { metaOf } from '@/skins/phone/blocks/project-model';
import { ProjectFacts } from '@/skins/phone/blocks/project-facts';
import { ProjectFeatured } from '@/skins/phone/blocks/project-featured';
import { ProjectLinks } from '@/skins/phone/blocks/project-links';
import { ProjectScreenshotStrip } from '@/skins/phone/blocks/project-screenshot-strip';
import { ProjectTags } from '@/skins/phone/blocks/project-tags';
import { ProjectTile } from '@/skins/phone/blocks/project-tile';
import { useScreenSizes } from '@/skins/phone/blocks/use-screen-sizes';
import { PhButton } from '@/skins/phone/ui/ph-button';
import { PhSection } from '@/skins/phone/ui/ph-section';

/**
 * Everything about one project: its name, kind and platforms, the cover, the description, the facts, the links, the technologies and the
 * screenshots. On a tablet it is the card beside the list; on a phone it is a screen of its own, with `onBack` as the way to the list.
 * `ref` is the region itself: where focus and the scroll go when the screen opens.
 */
export function ProjectDetail({
  project,
  skills,
  onBack,
  onOpenScreenshots,
  ref,
  className,
}: {
  project: Doc<'projects'>;
  skills: Map<string, Doc<'skills'>>;
  onBack?: () => void;
  onOpenScreenshots: (project: Doc<'projects'>, index: number) => void;
  ref?: Ref<HTMLElement>;
  className?: string;
}) {
  const copy = useCopy(projectsCopy);
  const own = useCopy(phoneProjectsCopy);
  const tags = skillsOf(project.technologies, skills);
  const hasImages = project.images.length > 0;
  const sizes = useScreenSizes(520, 1, 0);
  return (
    <section
      ref={ref}
      tabIndex={-1}
      aria-label={own.details}
      className={cn(
        'flex min-w-0 scroll-mt-2 flex-col outline-none',
        className,
      )}
    >
      {onBack && (
        <PhButton
          variant='ghost'
          onClick={onBack}
          className='-ml-2 mb-3 self-start pr-4 pl-2'
        >
          <ChevronLeft
            aria-hidden='true'
            className='size-5'
            strokeWidth={2.6}
          />
          {own.backToList}
        </PhButton>
      )}
      <header className='flex items-start gap-4'>
        <ProjectTile project={project} className='size-14' />
        <div className='min-w-0 flex-1'>
          <h2 className='text-[24px]/[1.2] font-extrabold tracking-[-0.01em] wrap-anywhere'>
            {project.name}
          </h2>
          <p className='mt-1 text-[15px]/[1.4] text-ph-mute'>
            {metaOf(project, copy)}
          </p>
          {project.highlight !== null && (
            <div className='mt-2'>
              <ProjectFeatured />
            </div>
          )}
        </div>
      </header>
      {project.cover && (
        <div className='relative mt-6 aspect-[16/9] overflow-hidden rounded-ph-inner @min-[900px]:aspect-[2/1] bg-ph-sheet-3'>
          <Image
            src={project.cover}
            alt={fill(copy.coverAlt, { name: project.name })}
            fill
            sizes={sizes}
            className='object-cover object-top'
          />
        </div>
      )}
      {project.summary && (
        <p className='mt-5 max-w-[62ch] text-[16px]/[1.65] text-pretty'>
          {project.summary}
        </p>
      )}
      <div className='mt-5'>
        <ProjectFacts project={project} />
      </div>
      {project.links.length > 0 && (
        <PhSection title={own.links} level={3} className='mt-7'>
          <ProjectLinks links={project.links} />
        </PhSection>
      )}
      {tags.length > 0 && (
        <PhSection title={copy.technologies} level={3} className='mt-7'>
          <ProjectTags skills={tags} />
        </PhSection>
      )}
      {hasImages && (
        <PhSection
          title={own.screenshots}
          level={3}
          className='mt-7'
          action={
            <PhButton
              variant='ghost'
              size='sm'
              onClick={() => onOpenScreenshots(project, 0)}
            >
              <Images aria-hidden='true' className='size-4' />
              {screenshotsLabel(project.images.length, copy)}
            </PhButton>
          }
        >
          <ProjectScreenshotStrip
            project={project}
            onOpen={(index) => onOpenScreenshots(project, index)}
          />
        </PhSection>
      )}
    </section>
  );
}
