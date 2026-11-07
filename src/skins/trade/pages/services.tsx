/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { servicesCopy } from '@/content/copy/services';
import { useCopy } from '@/lib/i18n/copy';
import { DeskServices } from '@/skins/trade/blocks/desk-services';
import { TvPage } from '@/skins/trade/ui/tv-page';
import { TvPanel } from '@/skins/trade/ui/tv-panel';

/** Services in the Trade skin: a broker catalogue, with the contact form as its order ticket. */
export function ServicesPage() {
  const copy = useCopy(servicesCopy);
  return (
    <TvPage page='services'>
      <TvPanel title={copy.title} intro={copy.intro}>
        <DeskServices />
      </TvPanel>
    </TvPage>
  );
}
