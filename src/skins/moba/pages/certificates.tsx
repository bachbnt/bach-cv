/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { certificatesCopy } from '@/content/copy/certificates';
import { useCopy } from '@/lib/i18n/copy';
import { CertificatesBoard } from '@/skins/moba/blocks/certificates-board';
import { MbPageGate } from '@/skins/moba/ui/mb-page-gate';
import { MbPageHead } from '@/skins/moba/ui/mb-page-head';

/** Certificates, at the shrine: the inventory, a slot for each certificate and the card of the chosen one. */
export function CertificatesPage() {
  const copy = useCopy(certificatesCopy);
  return (
    <MbPageGate page='certificates'>
      <MbPageHead title={copy.title} intro={copy.intro} />
      <CertificatesBoard />
    </MbPageGate>
  );
}
