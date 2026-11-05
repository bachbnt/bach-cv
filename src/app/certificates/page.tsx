/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { Metadata } from 'next';
import { CertificateList } from '@/components/certificates/certificate-list';
import { CertificatesHead } from '@/components/certificates/certificates-head';
import { PageShell } from '@/components/page-shell';
import { pageMetadata } from '@/lib/seo';

/** The tab title is English: the page is statically exported, and the language is chosen in the browser. */
export const metadata: Metadata = pageMetadata(
  '/certificates',
  'Certificates',
  'Professional certifications behind the skills on my resume.',
);

export default function CertificatesPage() {
  return (
    <PageShell page='certificates'>
      <CertificatesHead />
      <section className='mx-auto w-full max-w-[1200px] px-5 pt-14 pb-24 min-[721px]:px-12'>
        <CertificateList />
      </section>
    </PageShell>
  );
}
