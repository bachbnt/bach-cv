/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import {
  SERVICES_TITLE_ID,
  ServicesBody,
} from '@/skins/travel/blocks/services-body';
import { TlPage } from '@/skins/travel/ui/tl-page';
import { TlPanel } from '@/skins/travel/ui/tl-panel';

/** Services: tours you can book, and the contact form as the booking form. */
export function ServicesPage() {
  return (
    <TlPage page='services'>
      <TlPanel side='right' labelledBy={SERVICES_TITLE_ID}>
        <ServicesBody />
      </TlPanel>
    </TlPage>
  );
}
