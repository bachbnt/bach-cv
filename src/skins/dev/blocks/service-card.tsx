/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { CSSProperties } from 'react';
import type { Doc } from '@/lib/content/schema';
import { ServiceArt } from '@/skins/dev/blocks/service-art';
import { DevCard } from '@/skins/dev/ui/dev-card';

/** One service: its terminal picture, name and description. `index` orders the reveal. */
export function ServiceCard({
  service,
  index,
}: {
  service: Doc<'services'>;
  index: number;
}) {
  return (
    <DevCard
      as='article'
      data-reveal
      style={{ '--i': index % 6 } as CSSProperties}
    >
      <ServiceArt art={service.art} />
      <h2 className='text-[16px]'>{service.name}</h2>
      <p className='text-[14px] text-mute'>{service.description}</p>
    </DevCard>
  );
}
