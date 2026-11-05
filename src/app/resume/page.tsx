/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { Metadata } from 'next';
import { PageShell } from '@/components/page-shell';
import { EducationSection } from '@/components/resume/education-section';
import { ExperienceSection } from '@/components/resume/experience-section';
import { ResumeHead } from '@/components/resume/resume-head';
import { ResumeSkills } from '@/components/resume/resume-skills';
import { pageMetadata } from '@/lib/seo';

// A Server Component cannot read the client-side copy, so the tab title is English for now.
export const metadata: Metadata = pageMetadata(
  '/resume',
  'Resume',
  'Work experience, education and skills, with where each skill was used.',
);

export default function ResumePage() {
  return (
    <PageShell page='resume'>
      <ResumeHead />
      <ExperienceSection />
      <ResumeSkills />
      <EducationSection />
    </PageShell>
  );
}
