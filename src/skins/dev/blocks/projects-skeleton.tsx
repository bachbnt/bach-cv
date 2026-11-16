/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { projectsCopy } from '@/content/copy/projects';
import { useCopy } from '@/lib/i18n/copy';
import { FEATURED_LIST } from '@/skins/dev/blocks/featured-project';
import { ProjectCardSkeleton } from '@/skins/dev/blocks/project-card-skeleton';
import { PROJECT_CARD_GRID } from '@/skins/dev/blocks/project-grid';
import { ProjectsToolbarSkeleton } from '@/skins/dev/blocks/projects-toolbar-skeleton';
import { DevSection } from '@/skins/dev/ui/dev-section';

/** What the page typically shows: four featured projects and ten cards. */
const PROJECT_CARDS = 10;

/** The featured cards, then the controls and the grid of cards of the loaded page; the two titles are real. */
export function ProjectsSkeleton() {
  const copy = useCopy(projectsCopy);
  return (
    <>
      <DevSection title={copy.featured}>
        <div className={FEATURED_LIST}>
          {[0, 1, 2, 3].map((n) => (
            <ProjectCardSkeleton
              key={n}
              featured
              position={n}
              first={n === 0}
            />
          ))}
        </div>
      </DevSection>
      <DevSection title={copy.all}>
        <ProjectsToolbarSkeleton />
        <div className={PROJECT_CARD_GRID}>
          {Array.from({ length: PROJECT_CARDS }, (_, n) => (
            <ProjectCardSkeleton key={n} first={n === 0} />
          ))}
        </div>
      </DevSection>
    </>
  );
}
