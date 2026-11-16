/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import type { UseQueryResult } from '@tanstack/react-query';
import { servicesCopy } from '@/content/copy/services';
import { useLive } from '@/hooks/use-live';
import type { Doc } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { SERVICE_GRID, ServiceCard } from '@/skins/phone/blocks/service-card';
import { ServiceSkeleton } from '@/skins/phone/blocks/service-skeleton';
import { PhDataState } from '@/skins/phone/ui/ph-data-state';
import { HINGE_PANES } from '@/skins/phone/blocks/hinge-panes';
import { cn } from '@/lib/utils';

/**
 * What I do, a card for each service. Discuss starts the message of the contact form on that topic exactly like the topic chips do
 * (Standard's `selectTopic`) and takes you to it.
 */
export function ServiceList({
  query,
  onDiscuss,
}: {
  query: UseQueryResult<Doc<'services'>[]>;
  onDiscuss: (service: Doc<'services'>) => void;
}) {
  const copy = useCopy(servicesCopy);
  const { features } = useLive();
  const services = query.data ?? [];

  return (
    <PhDataState
      query={query}
      count={services.length}
      empty='services'
      subject='services'
      skeleton={<ServiceSkeleton />}
    >
      <ul
        aria-label={copy.list.label}
        className={cn(SERVICE_GRID, HINGE_PANES)}
      >
        {services.map((service, index) => (
          <ServiceCard
            key={service.id}
            service={service}
            discussable={features.contactForm}
            wide={services.length % 2 === 1 && index === services.length - 1}
            onDiscuss={() => onDiscuss(service)}
          />
        ))}
      </ul>
    </PhDataState>
  );
}
