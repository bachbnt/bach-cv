/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { servicesCopy } from '@/content/copy/services';
import { tradeDeskCopy } from '@/content/copy/trade-desk';
import type { Doc } from '@/lib/content/schema';
import { fill } from '@/components/services/message-form';
import { useCopy } from '@/lib/i18n/copy';
import { useContentQuery } from '@/lib/query/use-content';
import { cn } from '@/lib/utils';
import { DeskSection } from '@/skins/trade/blocks/desk-section';
import { TvButton } from '@/skins/trade/ui/tv-button';
import { TvDataState } from '@/skins/trade/ui/tv-data-state';
import { TvServiceArt } from '@/skins/trade/ui/tv-service-art';
import { TvSkeleton } from '@/skins/trade/ui/tv-skeleton';

/**
 * The broker catalogue: each service is a row with its drawing of the skin (`TvServiceArt`, chosen by the `art` of the service), name and description, and a Trade action that picks the service as the topic of
 * the order ticket. Without a `onTrade` (the contact form is off) the rows have no action.
 */
export function DeskCatalogue({
  topicId,
  onTrade,
}: {
  topicId: string;
  onTrade?: (service: Doc<'services'>) => void;
}) {
  const copy = useCopy(servicesCopy);
  const desk = useCopy(tradeDeskCopy).services;
  const query = useContentQuery('services');
  const services = query.data ?? [];

  return (
    <DeskSection
      id='tv-catalogue'
      title={copy.list.label}
      kicker={desk.catalogue}
    >
      <TvDataState
        query={query}
        count={services.length}
        empty='services'
        subject='services'
        skeleton={
          <div className='grid gap-2'>
            {Array.from({ length: 3 }, (_, i) => (
              <TvSkeleton key={i} className='h-32' />
            ))}
          </div>
        }
      >
        <ul className='m-0 grid list-none gap-2 p-0'>
          {services.map((service) => {
            const selected = service.id === topicId;
            return (
              <li
                key={service.id}
                data-selected={selected || undefined}
                className={cn(
                  'group/row grid grid-cols-[120px_minmax(0,1fr)] items-center gap-x-3 gap-y-2 rounded border bg-tv-bg p-2 transition-colors @[520px]:grid-cols-[192px_minmax(0,1fr)_auto] @[520px]:gap-x-4',
                  selected
                    ? 'border-tv-accent'
                    : 'border-tv-line hover:border-tv-dim',
                )}
              >
                <TvServiceArt art={service.art} />
                <div className='min-w-0'>
                  <h3 className='text-[13px]/snug font-semibold'>
                    {service.name}
                  </h3>
                  <p className='mt-1 text-xs/[1.55] text-tv-mute'>
                    {service.description}
                  </p>
                </div>
                {onTrade && (
                  <TvButton
                    variant={selected ? 'primary' : 'outline'}
                    aria-pressed={selected}
                    aria-label={fill(desk.tradeFor, {
                      trade: desk.trade,
                      name: service.name,
                    })}
                    onClick={() => onTrade(service)}
                    className='col-span-2 @[520px]:col-span-1 @[520px]:min-w-20'
                  >
                    {desk.trade}
                  </TvButton>
                )}
              </li>
            );
          })}
        </ul>
      </TvDataState>
    </DeskSection>
  );
}
