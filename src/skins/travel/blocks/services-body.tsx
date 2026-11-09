/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { useContactForm } from '@/components/services/use-contact-form';
import { servicesCopy } from '@/content/copy/services';
import { travelPostcardsCopy } from '@/content/copy/travel-postcards';
import { useLive } from '@/hooks/use-live';
import { settingsSchema } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { settingsQueryOptions } from '@/lib/query/options';
import { BookingSection } from '@/skins/travel/blocks/booking-section';
import { TourList } from '@/skins/travel/blocks/tour-list';
import { TlKicker } from '@/skins/travel/ui/tl-kicker';

/** The id of the page's heading: the panel is named by it. */
export const SERVICES_TITLE_ID = 'tl-services-title';

/** Until the settings arrive the form uses the schema defaults. */
const DEFAULT_LIMITS = settingsSchema.parse({}).contactForm;

/** The Services page body: the tours on top (they pick the topic) and the booking form under them, both driven by one `useContactForm`. */
export function ServicesBody() {
  const copy = useCopy(servicesCopy);
  const words = useCopy(travelPostcardsCopy).tours;
  const { features } = useLive();
  const { data: settings } = useQuery(settingsQueryOptions());
  const limits = settings?.contactForm ?? DEFAULT_LIMITS;
  const form = useContactForm(limits);

  return (
    <div className='flex flex-col gap-4 px-4 pt-1 pb-5 md:px-5 md:pt-5'>
      <header>
        <TlKicker>{words.kicker}</TlKicker>
        <h1
          id={SERVICES_TITLE_ID}
          className='m-0 text-[22px] leading-[1.15] font-extrabold'
        >
          {copy.title}
        </h1>
        <p className='m-0 mt-0.5 text-[13px] text-tl-muted'>
          {copy.intro}
          {features.contactForm && <> {words.pickHint}</>}
        </p>
      </header>
      <TourList topicId={form.topicId} onSelect={form.selectTopic} />
      <BookingSection form={form} limits={limits} />
    </div>
  );
}
