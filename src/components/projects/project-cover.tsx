/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Image from 'next/image';
import { fillCopy } from '@/components/projects/project-helpers';
import { initialsOf } from '@/lib/derive/initials';
import { projectsCopy } from '@/content/copy/projects';
import { useCopy } from '@/lib/i18n/copy';
import type { Doc } from '@/lib/content/schema';
import { cn } from 'cn';

const TILE: Record<Doc<'skills'>['category'], string> = {
  mobile: 'bg-mobile text-mobile-foreground',
  web: 'bg-web text-web-foreground',
  ai: 'bg-ai text-ai-foreground',
  tools: 'bg-tools text-tools-foreground',
};

/**
 * The cover of a project. Without one, a tile with the initials stands in,
 * tinted by the category of the first technology.
 */
export function ProjectCover({
  project,
  firstSkill,
  className,
}: {
  project: Doc<'projects'>;
  firstSkill?: Doc<'skills'>;
  className?: string;
}) {
  const copy = useCopy(projectsCopy);
  if (project.cover) {
    return (
      <Image
        src={project.cover}
        alt={fillCopy(copy.coverAlt, { name: project.name })}
        width={640}
        height={520}
        className={cn(
          'block w-full bg-secondary object-cover object-top',
          className,
        )}
      />
    );
  }
  return (
    <div
      aria-hidden='true'
      className={cn(
        'flex w-full items-center justify-center font-heading text-[64px] font-bold tracking-[-0.03em]',
        firstSkill
          ? TILE[firstSkill.category]
          : 'bg-secondary text-muted-foreground',
        className,
      )}
    >
      {initialsOf(project.name)}
    </div>
  );
}
