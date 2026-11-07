/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { aboutCopy } from '@/content/copy/about';
import { useCopy } from '@/lib/i18n/copy';
import { DeskAboutFacts } from '@/skins/trade/blocks/desk-about-facts';
import { DeskAboutLinks } from '@/skins/trade/blocks/desk-about-links';
import { DeskAboutMedia } from '@/skins/trade/blocks/desk-about-media';
import { DeskAboutStack } from '@/skins/trade/blocks/desk-about-stack';
import { DeskAboutSymbol } from '@/skins/trade/blocks/desk-about-symbol';
import { DeskAboutTimeline } from '@/skins/trade/blocks/desk-about-timeline';
import { DeskAskBot } from '@/skins/trade/blocks/desk-ask-bot';
import { TvPage } from '@/skins/trade/ui/tv-page';
import { TvPanel } from '@/skins/trade/ui/tv-panel';

/**
 * About in the Trade skin: the page of a symbol. The profile, the key facts, the education as corporate actions and the core stack as its
 * composition on the left; the links, the photos and BB Bot on the right (below on a narrow panel).
 */
export function AboutPage() {
  const copy = useCopy(aboutCopy);
  return (
    <TvPage page='about'>
      <TvPanel title={copy.title}>
        <div className='@container'>
          <div className='grid gap-3 p-3.5 @[760px]:grid-cols-[minmax(0,1fr)_340px] @[760px]:items-start'>
            <div className='grid min-w-0 gap-3'>
              <DeskAboutSymbol />
              <DeskAboutFacts />
              <DeskAboutTimeline />
              <DeskAboutStack />
            </div>
            <div className='grid min-w-0 gap-3'>
              <DeskAboutLinks />
              <DeskAboutMedia />
              <DeskAskBot />
            </div>
          </div>
        </div>
      </TvPanel>
    </TvPage>
  );
}
