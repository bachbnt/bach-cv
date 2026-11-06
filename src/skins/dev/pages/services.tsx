/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { servicesCopy } from '@/content/copy/services';
import { useCopy } from '@/lib/i18n/copy';
import { ContactSection } from '@/skins/dev/blocks/contact-section';
import { ServiceList } from '@/skins/dev/blocks/service-list';
import { DevPage } from '@/skins/dev/ui/dev-page';
import { DevPageHead } from '@/skins/dev/ui/dev-page-head';
import { DevSectionBox } from '@/skins/dev/ui/dev-section-box';
import '@/skins/dev/css/services.css';

/** Services in the Dev skin: what I do, as terminal cards, and the contact form. */
export function ServicesPage() {
  const copy = useCopy(servicesCopy);

  return (
    <DevPage page='services'>
      <DevPageHead page='services' title={copy.title} intro={copy.intro} />
      <DevSectionBox>
        <ServiceList />
      </DevSectionBox>
      <DevSectionBox id='contact'>
        <ContactSection />
      </DevSectionBox>
    </DevPage>
  );
}
