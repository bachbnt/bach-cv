/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { aboutCopy } from '@/content/copy/about';
import { useCopy } from '@/lib/i18n/copy';
import { DevCoreStack } from '@/skins/dev/blocks/core-stack';
import { DevSection } from '@/skins/dev/ui/dev-section';

/** The skills I use every day, with a link to the full list on Resume. */
export function AboutCoreStackSection() {
  const { core } = useCopy(aboutCopy);
  return (
    <DevSection
      title={core.title}
      sub={core.lead}
      action={{ label: core.all, href: '/resume#skills' }}
    >
      <DevCoreStack />
    </DevSection>
  );
}
