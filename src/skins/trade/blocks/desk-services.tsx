/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { useContactForm } from '@/components/services/use-contact-form';
import { useLive } from '@/hooks/use-live';
import { settingsSchema } from '@/lib/content/schema';
import { settingsQueryOptions } from '@/lib/query/options';
import { useContentQuery } from '@/lib/query/use-content';
import { DeskCatalogue } from '@/skins/trade/blocks/desk-catalogue';
import { DeskTicket } from '@/skins/trade/blocks/desk-ticket';

/** Until the settings arrive the form uses the schema defaults. */
const DEFAULT_LIMITS = settingsSchema.parse({}).contactForm;

/**
 * The Services desk: the catalogue and the order ticket share one form, so the Trade action of a row fills the topic of the ticket. The
 * ticket sits beside the catalogue and stays in view from 700px of panel; below that it comes after the catalogue.
 */
export function DeskServices() {
  const { features } = useLive();
  const { data: services = [] } = useContentQuery('services');
  const { data: settings } = useQuery(settingsQueryOptions());
  const limits = settings?.contactForm ?? DEFAULT_LIMITS;
  const form = useContactForm(limits);

  return (
    <div className='@container'>
      <div className='grid gap-3 p-3.5 @[700px]:grid-cols-[minmax(0,1fr)_330px] @[700px]:items-start'>
        <DeskCatalogue
          topicId={form.topicId}
          onTrade={features.contactForm ? form.selectTopic : undefined}
        />
        <DeskTicket
          form={form}
          limits={limits}
          services={services}
          className='@[700px]:sticky @[700px]:top-3'
        />
      </div>
    </div>
  );
}
