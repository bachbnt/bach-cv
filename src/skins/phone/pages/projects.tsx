/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { projectsCopy } from '@/content/copy/projects';
import { useCopy } from '@/lib/i18n/copy';
import { ProjectsContent } from '@/skins/phone/blocks/projects-content';
import { PhPage } from '@/skins/phone/ui/ph-page';

/** Projects in the Phone skin: a Files-like app. A search field and two buttons over the list, and the open project beside it (a tablet) or on a screen of its own (a phone). */
export function ProjectsPage() {
  const copy = useCopy(projectsCopy);
  return (
    <PhPage page='projects' title={copy.title} lead={copy.intro} wide>
      <ProjectsContent />
    </PhPage>
  );
}
