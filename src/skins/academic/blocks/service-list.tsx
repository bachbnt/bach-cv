/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import type { UseQueryResult } from '@tanstack/react-query';
import { academicCertificatesServicesCopy } from '@/content/copy/academic-certificates-services';
import { servicesCopy } from '@/content/copy/services';
import { useLive } from '@/hooks/use-live';
import type { Doc } from '@/lib/content/schema';
import { fill } from '@/lib/chat/fill';
import { useCopy } from '@/lib/i18n/copy';
import { ServiceSkeleton } from '@/skins/academic/blocks/service-skeleton';
import { AcDataState } from '@/skins/academic/ui/ac-data-state';
import { AcButton } from '@/skins/academic/ui/ac-button';
import { AcIcon } from '@/skins/academic/ui/ac-icon';

/**
 * What I do, as the work packages of a proposal: a numbered line each (decoration), the name, the description and, when the contact form is on,
 * Discuss, which starts the message on that topic exactly like the topic chips of the form (Standard's `selectTopic`) and takes you to it.
 */
export function ServiceList({
  query,
  onDiscuss,
}: {
  query: UseQueryResult<Doc<'services'>[]>;
  onDiscuss: (service: Doc<'services'>) => void;
}) {
  const copy = useCopy(servicesCopy);
  const own = useCopy(academicCertificatesServicesCopy).services;
  const { features } = useLive();
  const services = query.data ?? [];

  return (
    <AcDataState
      query={query}
      count={services.length}
      empty='services'
      subject='services'
      skeleton={<ServiceSkeleton />}
      className='mt-8'
    >
      {/* the text stays left of the ruled margin (262px of notes and the gap), as the text of every page does */}
      <ol
        aria-label={copy.list.label}
        className='m-0 list-none p-0 min-[900px]:pr-[308px]'
      >
        {services.map((service, index) => (
          <li
            key={service.id}
            className='grid grid-cols-1 gap-x-[18px] gap-y-1 border-t-2 border-dashed border-ac-faint py-[18px] min-[561px]:grid-cols-[70px_minmax(0,1fr)]'
          >
            <span
              aria-hidden='true'
              className='pt-1 font-ac-chalk text-[28px]/none text-ac-accent'
            >
              {fill(own.package, { n: index + 1 })}
            </span>
            <div className='min-w-0'>
              <h2 className='font-ac-chalk text-[30px]/[1.12] font-normal'>
                {service.name}
              </h2>
              <p className='mt-1.5 mb-2.5 text-ac-ink'>{service.description}</p>
              {features.contactForm && (
                <AcButton
                  variant='quiet'
                  size='sm'
                  aria-label={fill(own.discussLabel, { name: service.name })}
                  onClick={() => onDiscuss(service)}
                >
                  {own.discuss}
                  <AcIcon name='pencil' />
                </AcButton>
              )}
            </div>
          </li>
        ))}
      </ol>
    </AcDataState>
  );
}
