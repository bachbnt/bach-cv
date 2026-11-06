/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { aboutCopy } from '@/content/copy/about';
import { useCopy } from '@/lib/i18n/copy';
import { AboutCoreStackSection } from '@/skins/dev/blocks/about-core-stack-section';
import { AboutHead } from '@/skins/dev/blocks/about-head';
import { DevContactBand } from '@/skins/dev/blocks/contact-band';
import { DevPage } from '@/skins/dev/ui/dev-page';
import { DevPageHead } from '@/skins/dev/ui/dev-page-head';

export function AboutPage() {
  const copy = useCopy(aboutCopy);
  return (
    <DevPage page='about'>
      <DevPageHead page='about' title={copy.title} />
      <AboutHead />
      <AboutCoreStackSection />
      <DevContactBand />
    </DevPage>
  );
}
