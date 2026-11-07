/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { servicesCopy } from '@/content/copy/services';
import { useLive } from '@/hooks/use-live';
import type { Doc } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { useContentQuery } from '@/lib/query/use-content';
import { TourCard } from '@/skins/travel/blocks/tour-card';
import { TlDataState } from '@/skins/travel/ui/tl-data-state';
import { TlSkeleton } from '@/skins/travel/ui/tl-skeleton';

/**
 * The tours: every service as a card, in the order of the `services` collection. With the contact form on, the tours are also the
 * topic chips (a group named Topic around the list), so one choice drives the booking form.
 */
export function TourList({
  topicId,
  onSelect,
}: {
  topicId: string;
  onSelect: (service: Doc<'services'>) => void;
}) {
  const copy = useCopy(servicesCopy);
  const { features } = useLive();
  const query = useContentQuery('services');
  const services = query.data ?? [];
  const list = (
    <ul aria-label={copy.list.label} className='m-0 grid list-none gap-2 p-0'>
      {services.map((service) => (
        <li key={service.id}>
          <TourCard
            service={service}
            chosen={service.id === topicId}
            onChoose={
              features.contactForm ? () => onSelect(service) : undefined
            }
          />
        </li>
      ))}
    </ul>
  );
  return (
    <TlDataState
      query={query}
      count={services.length}
      empty='services'
      subject='services'
      skeleton={
        <div className='grid gap-2'>
          {[0, 1, 2].map((i) => (
            <TlSkeleton key={i} className='h-[68px] rounded-2xl' />
          ))}
        </div>
      }
    >
      {features.contactForm ? (
        <div role='group' aria-label={copy.cta.topicLabel}>
          {list}
        </div>
      ) : (
        list
      )}
    </TlDataState>
  );
}
