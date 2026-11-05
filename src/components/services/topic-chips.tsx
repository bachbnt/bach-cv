/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { servicesCopy } from '@/content/copy/services';
import { useCopy } from '@/lib/i18n/copy';
import type { Doc } from '@/lib/content/schema';

/** One chip per service. Choosing one puts its starting sentence into the message. */
export function TopicChips({
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
        <button
          key={service.id}
          type='button'
          aria-pressed={service.id === topicId}
          onClick={() => onSelect(service)}
          className='rounded-full border-[1.5px] border-border bg-card px-[18px] py-[9px] text-[15px] font-medium text-foreground transition-[transform,background-color,border-color,color] duration-200 hover:border-foreground active:scale-[.97] active:border-foreground aria-pressed:border-page aria-pressed:bg-page aria-pressed:text-background max-[720px]:min-h-11 pointer-coarse:min-h-11'
        >
          {service.name}
        </button>
      ))}
    </div>
  );
}
