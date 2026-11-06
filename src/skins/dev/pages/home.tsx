/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { DevContactBand } from '@/skins/dev/blocks/contact-band';
import { HomeBuild } from '@/skins/dev/blocks/home-build';
import { HomeHero } from '@/skins/dev/blocks/home-hero';
import { HomeProjects } from '@/skins/dev/blocks/home-projects';
import { HomeTechStrip } from '@/skins/dev/blocks/home-tech-strip';
import { HomeWork } from '@/skins/dev/blocks/home-work';
import { DevPage } from '@/skins/dev/ui/dev-page';

export function HomePage() {
  return (
    <DevPage page='home'>
      <HomeHero />
      <HomeTechStrip />
      <HomeWork />
      <HomeBuild />
      <HomeProjects />
      <DevContactBand />
    </DevPage>
  );
}
