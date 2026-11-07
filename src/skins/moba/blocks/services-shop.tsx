/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Check, Plus } from 'lucide-react';
import type { useContactForm } from '@/components/services/use-contact-form';
import { mobaServicesCopy } from '@/content/copy/moba-services';
import { servicesCopy } from '@/content/copy/services';
import { useLive } from '@/hooks/use-live';
import { useCopy } from '@/lib/i18n/copy';
import { useContentQuery } from '@/lib/query/use-content';
import { ServiceEmblem } from '@/skins/moba/blocks/services-emblem';
import { MbButton } from '@/skins/moba/ui/mb-button';
import { MbDataState } from '@/skins/moba/ui/mb-data-state';
import { MbSkeleton } from '@/skins/moba/ui/mb-skeleton';

/**
 * The shop: every service is an item with its own emblem, its name and what it is. The button of an item chooses its topic in the order
 * desk below, as the topic chips do (and it is left out when the form is switched off, as there is nothing to choose it for).
 */
export function ServicesShop({
  form,
}: {
  form: ReturnType<typeof useContactForm>;
}) {
  const copy = useCopy(servicesCopy);
  const mb = useCopy(mobaServicesCopy);
  const { features } = useLive();
  const query = useContentQuery('services');
  const services = query.data ?? [];
  return (
    <section
      aria-label={copy.list.label}
      data-part=''
      style={{ '--i': 1 } as React.CSSProperties}
      className='mb-rise px-6 py-4 max-[719px]:px-4'
    >
      <p className='mb-3 text-[10px] leading-none font-bold tracking-[0.22em] text-mb-teal-ink uppercase'>
        {mb.kickers.shop}
      </p>
      <MbDataState
        query={query}
        count={services.length}
        empty='services'
        subject='services'
        level={3}
        skeleton={
          <div className='grid gap-3'>
            {Array.from({ length: 3 }, (_, i) => (
              <MbSkeleton key={i} className='h-[132px]' />
            ))}
          </div>
        }
      >
        <ul
          role='list'
          aria-label={copy.list.label}
          className='m-0 grid list-none gap-3 p-0'
        >
          {services.map((service) => {
            const chosen = form.topicId === service.id;
            return (
              <li key={service.id} data-art={service.art}>
                <article
                  data-chosen={chosen ? '' : undefined}
                  className='mb-plaque mb-shop-item grid gap-x-5 gap-y-3 py-4 pr-5 pl-7 min-[600px]:grid-cols-[auto_minmax(0,1fr)] max-[599px]:pr-4 max-[599px]:pl-6'
                >
                  <ServiceEmblem
                    art={service.art}
                    className='max-[599px]:size-[72px]'
                  />
                  <div className='min-w-0'>
                    <h2
                      id={`svc-${service.id}`}
                      className='text-[24px] leading-tight mb-svc-title'
                    >
                      {service.name}
                    </h2>
                    <p className='mt-1.5 max-w-[56ch] text-[15px] leading-[1.6] text-mb-mute'>
                      {service.description}
                    </p>
                    {features.contactForm && (
                      <MbButton
                        variant={chosen ? 'gold' : 'ghost'}
                        size='sm'
                        aria-pressed={chosen}
                        aria-describedby={`svc-${service.id}`}
                        onClick={() => form.selectTopic(service)}
                        className='mb-focus-in mt-3'
                      >
                        {chosen ? (
                          <Check aria-hidden='true' className='size-3.5' />
                        ) : (
                          <Plus aria-hidden='true' className='size-3.5' />
                        )}
                        {mb.choose}
                      </MbButton>
                    )}
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </MbDataState>
    </section>
  );
}
