/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { aboutCopy } from '@/content/copy/about';
import { useCopy } from '@/lib/i18n/copy';
import { AboutCoreStack } from '@/skins/academic/blocks/about-core-stack';
import { AboutHead } from '@/skins/academic/blocks/about-head';
import { HomeContactBand } from '@/skins/academic/blocks/home-contact-band';
import { AcPage } from '@/skins/academic/ui/ac-page';
import { AcPageHead } from '@/skins/academic/ui/ac-page-head';

/** About as the authors' page of a manuscript: the profile and its specialties, the core stack, the correspondence. */
export function AboutPage() {
  const copy = useCopy(aboutCopy);
  return (
    <AcPage page='about'>
      <AcPageHead page='about' title={copy.title} />
      <AboutHead />
      <AboutCoreStack />
      <HomeContactBand />
    </AcPage>
  );
}
