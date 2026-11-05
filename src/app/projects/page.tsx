/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { Metadata } from 'next';
import { PageShell } from '@/components/page-shell';
import { ProjectsContent } from '@/components/projects/projects-content';
import { ProjectsHead } from '@/components/projects/projects-head';
import { pageMetadata } from '@/lib/seo';

// The page is exported statically and the copy module is client-only, so the tab title is the English one.
export const metadata: Metadata = pageMetadata(
  '/projects',
  'Projects',
  'Tools I build for myself, and apps and sites I shipped for clients.',
);

export default function ProjectsPage() {
  return (
    <PageShell page='projects'>
      <ProjectsHead />
      <ProjectsContent />
    </PageShell>
  );
}
