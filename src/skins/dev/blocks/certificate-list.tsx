/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useContentQuery } from '@/lib/query/use-content';
import { DevCertificateGallery } from '@/skins/dev/blocks/certificate-gallery';
import { DevCertificateSkeleton } from '@/skins/dev/blocks/certificate-skeleton';
import { DevDataState } from '@/skins/dev/ui/dev-data-state';

/** The certificates, with the loading, empty and error states of every data block. */
export function DevCertificateList() {
  const certificates = useContentQuery('certificates');
  const items = certificates.data ?? [];
  return (
    <DevDataState
      query={certificates}
      count={items.length}
      empty='certificates'
      subject='certificates'
      skeleton={<DevCertificateSkeleton />}
    >
      <DevCertificateGallery />
    </DevDataState>
  );
}
