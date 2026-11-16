/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useCallback, useEffect } from 'react';
import { useContactForm } from '@/components/services/use-contact-form';
import { servicesCopy } from '@/content/copy/services';
import { useContactLimits } from '@/hooks/use-contact-limits';
import { prefersReducedMotion } from '@/hooks/use-reduced-motion';
import { useScrollToHash } from '@/hooks/use-scroll-to-hash';
import type { Doc } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { useContentQuery } from '@/lib/query/use-content';
import { ContactSection } from '@/skins/phone/blocks/contact-section';
import { ServiceList } from '@/skins/phone/blocks/service-list';
import { PhPage } from '@/skins/phone/ui/ph-page';

/**
 * Services in the Phone skin: a card for each service, then the contact form. The form is kept here so that Discuss on a service and the
 * topic chips of the form write to the same message.
 */
export function ServicesPage() {
  const copy = useCopy(servicesCopy);
  const services = useContentQuery('services');
  const limits = useContactLimits();
  const form = useContactForm(limits);
  const { topicId, selectTopic, messageRef } = form;

  /** Starts the message on a topic like its chip does, then takes the visitor to the form (the chip would switch it off a second time). */
  const discuss = useCallback(
    (service: Doc<'services'>) => {
      if (topicId !== service.id) selectTopic(service);
      else messageRef.current?.focus();
      document.getElementById('contact-cta')?.scrollIntoView({
        block: 'start',
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      });
    },
    [topicId, selectTopic, messageRef],
  );

  // `/services#contact-cta` opens on the form once the rows above it have their data (they push it down when they arrive), and a later
  // change of the address does the same; the scroller keeps the bars clear (its scroll padding and `scroll-mt` of the section)
  useScrollToHash(!services.isPending);
  useEffect(() => {
    const onHash = () => {
      if (window.location.hash === '#contact-cta')
        document.getElementById('contact-cta')?.scrollIntoView();
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  return (
    <PhPage page='services' title={copy.title} lead={copy.intro} wide>
      <ServiceList query={services} onDiscuss={discuss} />
      <ContactSection form={form} limits={limits} />
    </PhPage>
  );
}
