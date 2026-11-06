/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { servicesCopy } from '@/content/copy/services';
import type { Doc } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';

/** One chip per service. Choosing one puts its starting sentence into the message; choosing it again takes it out. */
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

  // an empty value means the chosen chip was pressed again: the hook toggles it off
  const change = ([next]: string[]) => {
    const service = services.find((s) => s.id === (next ?? topicId));
    if (service) onSelect(service);
  };

  return (
    <ToggleGroup
      aria-label={copy.cta.topicLabel}
      value={topicId ? [topicId] : []}
      onValueChange={change}
      className='my-4 flex-wrap'
    >
      {services.map((service) => (
        <ToggleGroupItem
          key={service.id}
          value={service.id}
          data-slot='dev-topic'
          className='h-auto cursor-pointer rounded-[4px] border border-line-2 bg-chrome px-[13px] py-2 font-code text-[13px]/[1.6] font-normal text-ink transition-[border-color,transform] duration-150 ease-[ease] hover:border-signal hover:[transform:translateY(-1px)] focus-visible:border-line-2 focus-visible:ring-0 active:[transform:scale(0.97)] aria-pressed:border-signal aria-pressed:bg-sel aria-pressed:text-head pointer-coarse:min-h-11'
        >
          {service.name}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
