/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { servicesCopy } from '@/content/copy/services';
import type { Doc } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { ToggleChip } from '@/skins/phone/blocks/toggle-chip';

/** One chip per service. Choosing one puts its starting sentence into the message (Standard's topic chips). */
export function ContactTopics({
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
      className='flex flex-wrap gap-2.5'
    >
      {services.map((service) => (
        <ToggleChip
          key={service.id}
          aria-pressed={service.id === topicId}
          onClick={() => onSelect(service)}
        >
          {service.name}
        </ToggleChip>
      ))}
    </div>
  );
}
