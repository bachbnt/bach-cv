/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { DataState } from '@/components/data-state';
import { CardsSkeleton } from '@/components/cards-skeleton';
import { ServiceCard } from '@/components/services/service-card';
import { servicesCopy } from '@/content/copy/services';
import { useCopy } from '@/lib/i18n/copy';
import { useContentQuery } from '@/lib/query/use-content';

/** The grid of services, read from the `services` collection. */
export function ServiceList() {
  const copy = useCopy(servicesCopy);
  const query = useContentQuery('services');
  const services = query.data ?? [];

  return (
    <DataState
      query={query}
      count={services.length}
      empty='services'
      subject='services'
      skeleton={<CardsSkeleton count={3} min={340} height={420} />}
      className='mt-12'
    >
      <div
        role='list'
        aria-label={copy.list.label}
        className='mt-12 grid grid-cols-[repeat(auto-fill,minmax(min(100%,340px),1fr))] gap-6'
      >
        {services.map((service) => (
          <div key={service.id} role='listitem' className='contents'>
            <ServiceCard service={service} />
          </div>
        ))}
      </div>
    </DataState>
  );
}
