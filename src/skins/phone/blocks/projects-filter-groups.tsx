/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useState } from 'react';
import { projectsCopy } from '@/content/copy/projects';
import type { ProjectView } from '@/hooks/use-project-view';
import { useCopy } from '@/lib/i18n/copy';
import { useContentQuery } from '@/lib/query/use-content';
import { ProjectChoice } from '@/skins/phone/blocks/project-choice';
import { choiceLabel } from '@/skins/phone/blocks/project-model';
import { skillHue } from '@/skins/phone/blocks/skill-hue';
import { ProjectsFilterGroup } from '@/skins/phone/blocks/projects-filter-group';

/**
 * The four filters as groups of chips (the type, the platform, the status and the technologies with the most used first and the rest behind
 * "More"), the same in the sheet of a phone and in the popover of a tablet. What is on offer is the owner's and `useProjectView`'s.
 */
export function ProjectsFilterGroups({ view }: { view: ProjectView }) {
  const copy = useCopy(projectsCopy);
  const [moreOpen, setMoreOpen] = useState(false);
  const { groups } = view;
  const { data: skills = [] } = useContentQuery('skills');
  const categories = new Map(skills.map((skill) => [skill.id, skill.category]));
  const techMore = view.tech.more;
  const showMore =
    moreOpen || techMore.some((o) => groups.tech.selected.includes(o.value));

  return (
    <div className='flex flex-col gap-6'>
      {groups.kind.visible && (
        <ProjectsFilterGroup label={copy.filters.kind}>
          <ProjectChoice
            label={copy.filterAll}
            pressed={groups.kind.selected.length === 0}
            onClick={() => groups.kind.set([])}
          />
          {groups.kind.options.map((option) => (
            <ProjectChoice
              key={option.value}
              label={choiceLabel('kind', option, copy)}
              count={option.count}
              pressed={groups.kind.selected.includes(option.value)}
              onClick={() => groups.kind.set([option.value])}
            />
          ))}
        </ProjectsFilterGroup>
      )}
      {groups.platform.visible && (
        <ProjectsFilterGroup label={copy.filters.platform}>
          {groups.platform.options.map((option) => (
            <ProjectChoice
              key={option.value}
              label={choiceLabel('platform', option, copy)}
              count={option.count}
              pressed={groups.platform.selected.includes(option.value)}
              onClick={() => groups.platform.toggle(option.value)}
            />
          ))}
        </ProjectsFilterGroup>
      )}
      {groups.status.visible && (
        <ProjectsFilterGroup label={copy.filters.status}>
          {groups.status.options.map((option) => (
            <ProjectChoice
              key={option.value}
              label={choiceLabel('status', option, copy)}
              count={option.count}
              pressed={groups.status.selected.includes(option.value)}
              onClick={() => groups.status.toggle(option.value)}
            />
          ))}
        </ProjectsFilterGroup>
      )}
      {groups.tech.visible && (
        <ProjectsFilterGroup label={copy.filters.tech}>
          {[...view.tech.top, ...(showMore ? techMore : [])].map((option) => (
            <ProjectChoice
              key={option.value}
              label={option.label}
              count={option.count}
              hue={skillHue(categories.get(option.value))}
              pressed={groups.tech.selected.includes(option.value)}
              onClick={() => groups.tech.toggle(option.value)}
            />
          ))}
          {techMore.length > 0 && (
            <button
              type='button'
              aria-expanded={showMore}
              onClick={() => setMoreOpen(!showMore)}
              className='inline-flex h-10 cursor-pointer items-center rounded-full px-3 text-[15px] font-semibold text-ph-accent-ink underline underline-offset-4 pointer-coarse:h-11'
            >
              {showMore ? copy.filters.fewer : copy.filters.more}
            </button>
          )}
        </ProjectsFilterGroup>
      )}
    </div>
  );
}
