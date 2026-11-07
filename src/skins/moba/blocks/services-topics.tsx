/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { servicesCopy } from '@/content/copy/services';
import { useCopy } from '@/lib/i18n/copy';
import type { Doc } from '@/lib/content/schema';

/** One chip per service. Choosing one puts its starting sentence into the message; choosing it again takes it back. */
export function ServicesTopics({
  services,
  topicId,
  onSelect,
}: {
  services: Doc<'services'>[];
  topicId: string;
  onSelect: (service: Doc<'services'>) => void;
}) {
  const copy = useCopy(servicesCopy);
  if (!services.length) return null;
  return (
    <div
      role='group'
      aria-label={copy.cta.topicLabel}
      className='mb-4 flex flex-wrap gap-2'
    >
      {services.map((service) => (
        <button
          key={service.id}
          type='button'
          aria-pressed={service.id === topicId}
          onClick={() => onSelect(service)}
          className='min-h-9 cursor-pointer border border-mb-line bg-mb-well px-3.5 py-1.5 text-[13.5px] font-bold text-mb-ink transition-colors hover:border-mb-gold hover:text-mb-gold-ink aria-pressed:border-mb-gold aria-pressed:bg-mb-gold/25 aria-pressed:text-mb-gold-ink pointer-coarse:min-h-11'
        >
          {service.name}
        </button>
      ))}
    </div>
  );
}
