/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { certificatesCopy } from '@/content/copy/certificates';
import { issuedNewestFirst } from '@/lib/derive/recency';
import { useCopy } from '@/lib/i18n/copy';
import { useContentQuery } from '@/lib/query/use-content';
import { CertificateGallery } from '@/skins/academic/blocks/certificate-gallery';
import { CertificateSeal } from '@/skins/academic/blocks/certificate-seal';
import { CertificateSkeleton } from '@/skins/academic/blocks/certificate-skeleton';
import { AcDataState } from '@/skins/academic/ui/ac-data-state';
import { AcRow } from '@/skins/academic/ui/ac-note';
import { AcPage } from '@/skins/academic/ui/ac-page';
import { AcPageHead } from '@/skins/academic/ui/ac-page-head';

/** Certificates in the Academic skin: the peer review, a reviewer's card for each certificate with a seal in the margin. */
export function CertificatesPage() {
  const copy = useCopy(certificatesCopy);
  const certificates = useContentQuery('certificates');
  // newest first, so the first card is the latest issued whatever the order the documents came in
  const items = issuedNewestFirst(certificates.data ?? []);
  return (
    <AcPage page='certificates'>
      <AcRow
        tone='b'
        note={items.length > 0 ? <CertificateSeal items={items} /> : undefined}
      >
        <AcPageHead page='certificates' title={copy.title} lead={copy.intro} />
      </AcRow>
      <AcDataState
        query={certificates}
        count={items.length}
        empty='certificates'
        subject='certificates'
        skeleton={<CertificateSkeleton />}
      >
        <CertificateGallery items={items} />
      </AcDataState>
    </AcPage>
  );
}
