/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { HOME_TITLE_ID, HomeHero } from '@/skins/travel/blocks/home-hero';
import {
  HomeBuilds,
  HomeContact,
  HomeFeatured,
  HomeLuggage,
  HomePipeline,
  HomeWork,
} from '@/skins/travel/blocks/home-sections';
import { TlPage } from '@/skins/travel/ui/tl-page';
import { TlPanel } from '@/skins/travel/ui/tl-panel';

/**
 * The trip overview: the whole route is on the map and the current role is the destination ("You are here"). The card has the
 * Standard Home content in the order of Standard: the introduction, how a bug becomes a merge request, the technologies, what was built,
 * where I have worked, the featured projects and the contact band.
 */
export function HomePage() {
  return (
    <TlPage page='home'>
      <TlPanel side='left' labelledBy={HOME_TITLE_ID}>
        <div className='grid gap-5 p-4 pt-2 md:p-5'>
          <HomeHero />
          <HomePipeline />
          <HomeLuggage />
          <HomeBuilds />
          <HomeWork />
          <HomeFeatured />
          <HomeContact />
        </div>
      </TlPanel>
    </TlPage>
  );
}
