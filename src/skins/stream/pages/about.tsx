/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { AboutChannel } from '@/skins/stream/blocks/about-channel';
import { StreamPage } from '@/skins/stream/ui/stream-page';

/** About as the page of a channel: banner, photo, name and tags, and tabs for the About panel and the core stack. */
export function AboutPage() {
  return (
    <StreamPage page='about'>
      <AboutChannel />
    </StreamPage>
  );
}
