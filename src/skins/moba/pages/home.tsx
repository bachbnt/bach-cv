/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { HomeBuild } from '@/skins/moba/blocks/home-build';
import { HomeContact } from '@/skins/moba/blocks/home-contact';
import { HomeFeatured } from '@/skins/moba/blocks/home-featured';
import { HomeHero } from '@/skins/moba/blocks/home-hero';
import { HomePipeline } from '@/skins/moba/blocks/home-pipeline';
import { HomeTech } from '@/skins/moba/blocks/home-tech';
import { HomeWork } from '@/skins/moba/blocks/home-work';
import { MbPageGate } from '@/skins/moba/ui/mb-page-gate';

/** Home, at the fountain: the champion select, the recall path, the skills, the match history, the loadout, the objectives and the lobby. */
export function HomePage() {
  return (
    <MbPageGate page='home'>
      <HomeHero />
      <HomeTech />
      <HomePipeline />
      <HomeWork />
      <HomeBuild />
      <HomeFeatured />
      <HomeContact />
    </MbPageGate>
  );
}
