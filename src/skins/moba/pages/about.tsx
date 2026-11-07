/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { AboutCore } from '@/skins/moba/blocks/about-core';
import { AboutHero } from '@/skins/moba/blocks/about-hero';
import { HomeContact } from '@/skins/moba/blocks/home-contact';
import { MbPageGate } from '@/skins/moba/ui/mb-page-gate';

/** About, at the lore stone: the champion select (who I am, what I specialise in, the photos), the key skills and the lobby. */
export function AboutPage() {
  return (
    <MbPageGate page='about'>
      <AboutHero />
      <AboutCore />
      <HomeContact />
    </MbPageGate>
  );
}
