/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { ServiceCard } from '@/components/services/service-card';
import { servicesCopy } from '@/content/copy/services';
import { useCopy } from '@/lib/i18n/copy';
import { useContentQuery } from '@/lib/query/use-content';

/** The grid of services, read from the `services` collection. */
export function ServiceList() {
  const copy = useCopy(servicesCopy);
  const { data: services, isPending } = useContentQuery('services');

  if (isPending) {
    return (
      <div
        aria-hidden='true'
        className='mt-12 grid grid-cols-[repeat(auto-fill,minmax(min(100%,340px),1fr))] gap-6'
      >
        {[0, 1, 2].map((n) => (
          <div
            key={n}
            className='h-[420px] animate-pulse rounded-2xl border border-border bg-white'
          />
        ))}
      </div>
    );
  }

  if (!services?.length) {
    return (
      <p className='mt-12 text-lg text-muted-foreground'>{copy.list.empty}</p>
    );
  }

  return (
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
  );
}
