/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { servicesCopy } from '@/content/copy/services';
import { useCopy } from '@/lib/i18n/copy';
import { ServicesBoard } from '@/skins/moba/blocks/services-board';
import { MbPageGate } from '@/skins/moba/ui/mb-page-gate';
import { MbPageHead } from '@/skins/moba/ui/mb-page-head';

/** Services, at the shop: the services as items of a shop, and the order desk where the visitor writes to me. */
export function ServicesPage() {
  const copy = useCopy(servicesCopy);
  return (
    <MbPageGate page='services'>
      <MbPageHead title={copy.title} intro={copy.intro} />
      <ServicesBoard />
    </MbPageGate>
  );
}
