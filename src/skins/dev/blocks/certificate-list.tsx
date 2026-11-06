/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useContentQuery } from '@/lib/query/use-content';
import { DevCertificateGallery } from '@/skins/dev/blocks/certificate-gallery';
import { DevDataState } from '@/skins/dev/ui/dev-data-state';
import { DevCardsSkeleton, DevSkeleton } from '@/skins/dev/ui/dev-skeleton';

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
      skeleton={
        <>
          <DevSkeleton style={{ height: 340 }} />
          <DevCardsSkeleton
            count={2}
            min={320}
            height={320}
            gap={18}
            className='mt-[18px]'
          />
        </>
      }
    >
      <DevCertificateGallery />
    </DevDataState>
  );
}
