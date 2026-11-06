/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { certificatesCopy } from '@/content/copy/certificates';
import { useCopy } from '@/lib/i18n/copy';
import { DevCertificateList } from '@/skins/dev/blocks/certificate-list';
import { DevPage } from '@/skins/dev/ui/dev-page';
import { DevPageHead } from '@/skins/dev/ui/dev-page-head';
import { DevSectionBox } from '@/skins/dev/ui/dev-section-box';

/** Certificates in the Dev skin: the latest one large, the others in a grid. */
export function CertificatesPage() {
  const copy = useCopy(certificatesCopy);
  return (
    <DevPage page='certificates'>
      <DevPageHead page='certificates' title={copy.title} intro={copy.intro} />
      <DevSectionBox>
        <DevCertificateList />
      </DevSectionBox>
    </DevPage>
  );
}
