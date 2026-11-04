/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { Metadata } from 'next';
import { AboutCoreStack } from '@/components/about/about-core-stack';
import { AboutHead } from '@/components/about/about-head';
import { ContactBand } from '@/components/contact-band';
import { PageShell } from '@/components/page-shell';
import { shell } from '@/lib/content/shell';

// A Server Component cannot read the client-side copy, so the tab title is English for now.
export const metadata: Metadata = {
  title: `About - ${shell.name}`,
};

export default function AboutPage() {
  return (
    <PageShell page='about'>
      <AboutHead />
      <AboutCoreStack />
      <ContactBand />
    </PageShell>
  );
}
