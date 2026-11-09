/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import {
  PASSPORT_TITLE_ID,
  PassportCover,
} from '@/skins/travel/blocks/passport-cover';
import { PassportList } from '@/skins/travel/blocks/passport-list';
import { TlPage } from '@/skins/travel/ui/tl-page';
import { TlPanel } from '@/skins/travel/ui/tl-panel';

/** Certificates: a travel passport, one round rubber stamp for each certificate. */
export function CertificatesPage() {
  return (
    <TlPage page='certificates'>
      <TlPanel side='right' labelledBy={PASSPORT_TITLE_ID}>
        <PassportCover />
        <PassportList />
      </TlPanel>
    </TlPage>
  );
}
