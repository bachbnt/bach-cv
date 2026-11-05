/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { Metadata } from 'next';
import { ContactSection } from '@/components/services/contact-section';
import { ServicesHead } from '@/components/services/services-head';
import { ServiceList } from '@/components/services/service-list';
import { PageShell } from '@/components/page-shell';
import { pageMetadata } from '@/lib/seo';

// Static metadata is English: the page is exported once and the language is chosen in the browser.
// (The copy module cannot be imported here because it calls a client-only helper.)
export const metadata: Metadata = pageMetadata(
  '/services',
  'Services',
  'Mobile apps, web development, teaching and open source: what I can do for your team or project.',
);

export default function ServicesPage() {
  return (
    <PageShell page='services'>
      <ServicesHead />
      <section className='mx-auto w-full max-w-[1200px] px-5 pt-14 pb-24 min-[721px]:px-12'>
        <ServiceList />
      </section>
      <ContactSection />
    </PageShell>
  );
}
