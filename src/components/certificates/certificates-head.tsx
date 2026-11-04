/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { PageHead } from '@/components/page-head';
import { certificatesCopy } from '@/content/copy/certificates';
import { useCopy } from '@/lib/i18n/copy';

/** The tinted head of the Certificates page, in the visitor's language. */
export function CertificatesHead() {
  const copy = useCopy(certificatesCopy);
  return <PageHead title={copy.title} intro={copy.intro} />;
}
