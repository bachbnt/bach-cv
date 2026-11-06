/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { servicesCopy } from '@/content/copy/services';
import { useCopy } from '@/lib/i18n/copy';
import { useContentQuery } from '@/lib/query/use-content';
import { ServiceCard } from '@/skins/dev/blocks/service-card';
import { ServiceGrid } from '@/skins/dev/blocks/service-grid';
import { ServiceListSkeleton } from '@/skins/dev/blocks/service-list-skeleton';
import { DevDataState } from '@/skins/dev/ui/dev-data-state';

/** The grid of services, read from the `services` collection. */
export function ServiceList() {
  const copy = useCopy(servicesCopy);
  const query = useContentQuery('services');
  const services = query.data ?? [];

  return (
    <DevDataState
      query={query}
      count={services.length}
      empty='services'
      subject='services'
      level={3}
      skeleton={<ServiceListSkeleton />}
    >
      <ServiceGrid role='list' aria-label={copy.list.label}>
        {services.map((service, index) => (
          <div key={service.id} role='listitem' className='contents'>
            <ServiceCard service={service} index={index} />
          </div>
        ))}
      </ServiceGrid>
    </DevDataState>
  );
}
