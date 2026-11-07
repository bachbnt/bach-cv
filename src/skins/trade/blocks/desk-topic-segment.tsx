/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { servicesCopy } from '@/content/copy/services';
import type { Doc } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { TvToggleChip } from '@/skins/trade/ui/tv-toggle-chip';

/**
 * The topic of the order ticket as a row of toggle chips, one for each service. It behaves like the Standard chips: a chip is
 * pressed or not, pressing it again lets go, and choosing one puts its starting sentence into the message.
 */
export function DeskTopicSegment({
  services,
  topicId,
  onSelect,
}: {
  services: Doc<'services'>[];
  topicId: string;
  onSelect: (service: Doc<'services'>) => void;
}) {
  const copy = useCopy(servicesCopy);
  return (
    <div
      role='group'
      aria-label={copy.cta.topicLabel}
      className='flex flex-wrap gap-1.5'
    >
      {services.map((service) => (
        <TvToggleChip
          key={service.id}
          aria-pressed={service.id === topicId}
          onClick={() => onSelect(service)}
        >
          {service.name}
        </TvToggleChip>
      ))}
    </div>
  );
}
