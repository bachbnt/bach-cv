/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { PageHead } from '@/components/page-head';
import { projectsCopy } from '@/content/copy/projects';
import { useCopy } from '@/lib/i18n/copy';

/** The tinted head of the Projects page, in the visitor's language. */
export function ProjectsHead() {
  const copy = useCopy(projectsCopy);
  return <PageHead title={copy.title} intro={copy.intro} />;
}
