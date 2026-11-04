/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { Metadata } from 'next';
import { PageShell } from '@/components/page-shell';
import { ProjectsContent } from '@/components/projects/projects-content';
import { ProjectsHead } from '@/components/projects/projects-head';
import { shell } from '@/lib/content/shell';

// The page is exported statically and the copy module is client-only, so the tab title is the English one.
export const metadata: Metadata = {
  title: `Projects - ${shell.name}`,
};

export default function ProjectsPage() {
  return (
    <PageShell page='projects'>
      <ProjectsHead />
      <ProjectsContent />
    </PageShell>
  );
}
