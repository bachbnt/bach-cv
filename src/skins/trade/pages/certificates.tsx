/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { DataCertsView } from '@/skins/trade/blocks/data-certs-view';
import { TvPage } from '@/skins/trade/ui/tv-page';

/** Certificates in the Trade skin: a calendar of what was issued and when, or a feed of cards, with the Standard preview window. */
export function CertificatesPage() {
  return (
    <TvPage page='certificates'>
      <DataCertsView />
    </TvPage>
  );
}
