/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { phoneProjectsCopy } from '@/content/copy/phone-projects';
import { projectsCopy } from '@/content/copy/projects';
import type { Doc } from '@/lib/content/schema';
import { formatPeriod } from '@/lib/format';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { FactRow } from '@/skins/phone/blocks/fact-row';
import { ProjectStatus } from '@/skins/phone/blocks/project-status';

/** What kind of project it is, where it runs, whether it goes on and when: the facts a filter could pick by, in a small table. */
export function ProjectFacts({ project }: { project: Doc<'projects'> }) {
  const copy = useCopy(projectsCopy);
  const own = useCopy(phoneProjectsCopy);
  const { lang } = useLang();
  return (
    <dl className='m-0 overflow-hidden rounded-ph-inner border border-ph-line'>
      <FactRow label={copy.filters.kind}>{copy.kinds[project.kind]}</FactRow>
      {project.platforms.length > 0 && (
        <FactRow label={copy.filters.platform}>
          {project.platforms
            .map((platform) => copy.platforms[platform])
            .join(', ')}
        </FactRow>
      )}
      <FactRow label={copy.filters.status}>
        <ProjectStatus project={project} />
      </FactRow>
      {project.startMonth && (
        <FactRow label={own.period}>
          {formatPeriod(project.startMonth, project.endMonth, lang)}
        </FactRow>
      )}
    </dl>
  );
}
