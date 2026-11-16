/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { certificatesCopy } from '@/content/copy/certificates';
import { issuedNewestFirst } from '@/lib/derive/recency';
import { useCopy } from '@/lib/i18n/copy';
import { useContentQuery } from '@/lib/query/use-content';
import { CertificateGallery } from '@/skins/phone/blocks/certificate-gallery';
import { CertificateSkeleton } from '@/skins/phone/blocks/certificate-skeleton';
import { PhDataState } from '@/skins/phone/ui/ph-data-state';
import { PhPage } from '@/skins/phone/ui/ph-page';

/** Certificates in the Phone skin: the Wallet, one card for each certificate. */
export function CertificatesPage() {
  const copy = useCopy(certificatesCopy);
  const certificates = useContentQuery('certificates');
  // newest first, so the first card is the latest issued whatever the order the documents came in
  const items = issuedNewestFirst(certificates.data ?? []);
  return (
    <PhPage page='certificates' title={copy.title} lead={copy.intro} wide>
      <PhDataState
        query={certificates}
        count={items.length}
        empty='certificates'
        subject='certificates'
        skeleton={<CertificateSkeleton />}
      >
        <CertificateGallery items={items} />
      </PhDataState>
    </PhPage>
  );
}
