/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { ContactCard } from '@/skins/trade/blocks/contact-card';
import { HomeBar } from '@/skins/trade/blocks/shell-home-bar';
import { HomeBuild } from '@/skins/trade/blocks/home-build';
import { HomeFeatured } from '@/skins/trade/blocks/home-featured';
import { HomeWork } from '@/skins/trade/blocks/home-work';
import { SymbolOverview } from '@/skins/trade/blocks/shell-symbol';
import { HeroNote } from '@/skins/trade/shell/hero-note';
import { TvPage } from '@/skins/trade/ui/tv-page';

/**
 * Home in the Trade skin: the overview of a symbol. The symbol (my name, the years that count up, the real counts) and the hero note
 * come first, then the widgets of the dashboard (featured projects as ideas, the latest roles, what I have built) and the contact
 * band. The pipeline is the idea card of the Details widget in the watchlist, which belongs to the frame.
 */
export function HomePage() {
  return (
    <TvPage page='home'>
      <HomeBar />
      <div className='@container tv-rise min-h-0 flex-1 overflow-auto max-[1100px]:overflow-visible'>
        <div className='grid gap-3 p-3.5 @3xl:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]'>
          <SymbolOverview />
          <HeroNote />
        </div>
        <div className='grid gap-3 px-3.5 pb-3.5'>
          <HomeFeatured />
          <div className='grid items-start gap-3 @4xl:grid-cols-2'>
            <HomeWork />
            <HomeBuild />
          </div>
          <div className='overflow-hidden rounded-md border border-tv-line bg-tv-panel'>
            <ContactCard />
          </div>
        </div>
      </div>
    </TvPage>
  );
}
