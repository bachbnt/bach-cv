/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { ContactBand } from '@/components/contact-band';
import { HomeBuild } from '@/components/home-build';
import { HomeHero } from '@/components/home-hero';
import { HomeProjects } from '@/components/home-projects';
import { HomeWork } from '@/components/home-work';
import { PageGate } from '@/components/page-gate';
import { SitePage } from '@/components/site-page';
import { TechStrip } from '@/components/tech-strip';

export default function Home() {
  return (
    <SitePage page='home'>
      <main className='flex flex-col'>
        <PageGate page='home'>
          <HomeHero />
          <TechStrip className='mt-24' />
          <HomeWork />
          <HomeBuild />
          <HomeProjects />
          <ContactBand />
        </PageGate>
      </main>
    </SitePage>
  );
}
