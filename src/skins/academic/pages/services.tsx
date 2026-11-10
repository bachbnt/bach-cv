/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useCallback } from 'react';
import { useContactForm } from '@/components/services/use-contact-form';
import { academicCertificatesServicesCopy } from '@/content/copy/academic-certificates-services';
import { servicesCopy } from '@/content/copy/services';
import { useContactLimits } from '@/hooks/use-contact-limits';
import type { Doc } from '@/lib/content/schema';
import { fill } from '@/lib/chat/fill';
import { useCopy } from '@/lib/i18n/copy';
import { useContentQuery } from '@/lib/query/use-content';
import { ContactSection } from '@/skins/academic/blocks/contact-section';
import { ServiceList } from '@/skins/academic/blocks/service-list';
import { AcNoteBig, AcNoteCap, AcRow } from '@/skins/academic/ui/ac-note';
import { AcPage } from '@/skins/academic/ui/ac-page';
import { AcPageHead } from '@/skins/academic/ui/ac-page-head';
import { prefersReducedMotion } from '@/hooks/use-reduced-motion';

/**
 * Services in the Academic skin: the proposal. The services are its work packages and the contact form is the way to answer it. The form is
 * kept here so that Discuss on a package and the topic chips of the form write to the same message.
 */
export function ServicesPage() {
  const copy = useCopy(servicesCopy);
  const own = useCopy(academicCertificatesServicesCopy).services;
  const services = useContentQuery('services');
  const limits = useContactLimits();
  const form = useContactForm(limits);
  const { topicId, selectTopic, messageRef } = form;

  /** Starts the message on a topic like its chip does, then takes the visitor to the form (the topic chip would toggle it off a second time). */
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

  const count = services.data?.length ?? 0;
  return (
    <AcPage page='services'>
      <AcRow
        tone='a'
        note={
          count > 0 ? (
            <>
              <AcNoteBig>{count}</AcNoteBig>
              <AcNoteCap>
                {fill(count === 1 ? own.noteOne : own.noteMany, { n: count })}
              </AcNoteCap>
            </>
          ) : undefined
        }
      >
        <AcPageHead page='services' title={copy.title} lead={copy.intro} />
      </AcRow>
      <ServiceList query={services} onDiscuss={discuss} />
      <ContactSection form={form} />
    </AcPage>
  );
}
