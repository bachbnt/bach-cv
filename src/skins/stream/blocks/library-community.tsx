/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { useContactForm } from '@/components/services/use-contact-form';
import { servicesCopy } from '@/content/copy/services';
import { settingsSchema } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { settingsQueryOptions } from '@/lib/query/options';
import { useContentQuery } from '@/lib/query/use-content';
import { LibraryComposer } from '@/skins/stream/blocks/library-composer';
import { LibraryPost } from '@/skins/stream/blocks/library-post';
import { StreamDataState } from '@/skins/stream/ui/stream-data-state';
import { StreamPageHead } from '@/skins/stream/ui/stream-page-head';
import { StreamSkeleton } from '@/skins/stream/ui/stream-skeleton';

/** Until the settings arrive the form uses the schema defaults. */
const DEFAULT_LIMITS = settingsSchema.parse({}).contactForm;

/**
 * The Services page as the Community tab: the services as posts in a feed and the contact form as the comment composer beside it
 * (below the feed on a phone). The composer and the posts share one form, so "Ask about this" on a post picks the topic of the message.
 */
export function LibraryCommunity() {
  const copy = useCopy(servicesCopy);
  const query = useContentQuery('services');
  const services = query.data ?? [];
  const { data: settings } = useQuery(settingsQueryOptions());
  const limits = settings?.contactForm ?? DEFAULT_LIMITS;
  const form = useContactForm(limits);

  return (
    <>
      <StreamPageHead title={copy.title} intro={copy.intro} />
      <div className='grid items-start gap-8 px-3 min-[701px]:px-0 min-[1001px]:grid-cols-[minmax(0,620px)_minmax(360px,480px)] min-[1001px]:gap-10'>
        <StreamDataState
          query={query}
          count={services.length}
          empty='services'
          subject='services'
          skeleton={
            <div className='flex flex-col gap-4'>
              {[0, 1].map((i) => (
                <div key={i} className='rounded-2xl border border-sm-line p-5'>
                  <div className='flex items-center gap-3'>
                    <StreamSkeleton className='size-10 rounded-full' />
                    <StreamSkeleton className='h-4 w-32 rounded-md' />
                  </div>
                  <StreamSkeleton className='mt-4 h-5 w-2/5 rounded-md' />
                  <StreamSkeleton className='mt-3 aspect-video' />
                </div>
              ))}
            </div>
          }
        >
          <ul
            aria-label={copy.list.label}
            className='m-0 flex list-none flex-col gap-4 p-0'
          >
            {services.map((service, i) => (
              <LibraryPost
                key={service.id}
                service={service}
                index={i}
                asking={service.id === form.topicId}
                onAsk={() => form.selectTopic(service)}
              />
            ))}
          </ul>
        </StreamDataState>
        <LibraryComposer form={form} limits={limits} services={services} />
      </div>
    </>
  );
}
