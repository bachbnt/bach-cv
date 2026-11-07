/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { aboutCopy } from '@/content/copy/about';
import { streamChannelCopy } from '@/content/copy/stream-channel';
import { useCopy } from '@/lib/i18n/copy';
import { AboutCoreStack } from '@/skins/stream/blocks/about-core-stack';
import { ChannelAboutPanel } from '@/skins/stream/blocks/channel-about-panel';
import { ChannelHeader } from '@/skins/stream/blocks/channel-header';
import { ChannelTabs } from '@/skins/stream/blocks/channel-tabs';

/** About as the page of a channel: its header, then tabs that really switch between the About panel and the core stack. */
export function AboutChannel() {
  const about = useCopy(aboutCopy);
  const { tabs } = useCopy(streamChannelCopy);
  return (
    <>
      <ChannelHeader />
      <ChannelTabs
        label={tabs}
        tabs={[
          { id: 'about', label: about.title, panel: <ChannelAboutPanel /> },
          { id: 'core', label: about.core.title, panel: <AboutCoreStack /> },
        ]}
      />
    </>
  );
}
