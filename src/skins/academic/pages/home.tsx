/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { HomeAbstract } from '@/skins/academic/blocks/home-abstract';
import { HomeBuild } from '@/skins/academic/blocks/home-build';
import { HomeContactBand } from '@/skins/academic/blocks/home-contact-band';
import { HomeKeywords } from '@/skins/academic/blocks/home-keywords';
import { HomePipeline } from '@/skins/academic/blocks/home-pipeline';
import { HomeProjects } from '@/skins/academic/blocks/home-projects';
import { HomeTitle } from '@/skins/academic/blocks/home-title';
import { HomeWork } from '@/skins/academic/blocks/home-work';
import { AcPage } from '@/skins/academic/ui/ac-page';

/** Home as the title page of a manuscript: the title, the abstract and its keywords, the method, Figure 1 and the results, the findings, the references, the correspondence. */
export function HomePage() {
  return (
    <AcPage page='home'>
      <HomeTitle />
      <HomeAbstract />
      <HomeKeywords />
      <HomePipeline />
      <HomeWork />
      <HomeBuild />
      <HomeProjects />
      <HomeContactBand />
    </AcPage>
  );
}
