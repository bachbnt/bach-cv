/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { MessageCircle } from 'lucide-react';
import { useChat } from '@/components/chat/chat-provider';
import type { FormLimits } from '@/components/services/message-form';
import type { useContactForm } from '@/components/services/use-contact-form';
import { mobaServicesCopy } from '@/content/copy/moba-services';
import { servicesCopy } from '@/content/copy/services';
import { useLive } from '@/hooks/use-live';
import { useCopy } from '@/lib/i18n/copy';
import { useContentQuery } from '@/lib/query/use-content';
import { ServicesForm } from '@/skins/moba/blocks/services-form';
import { ServicesSent } from '@/skins/moba/blocks/services-sent';
import { ServicesTopics } from '@/skins/moba/blocks/services-topics';
import { MbButton } from '@/skins/moba/ui/mb-button';
import { MbCard } from '@/skins/moba/ui/mb-card';
import { MbSection } from '@/skins/moba/ui/mb-section';

/**
 * "What do you want to build?", the order desk: the topic chips, the form (or the note that it is taking a break, when `site/live` turns
 * it off) and Ask BB Bot (when the chat is on). The anchor is `contact-cta`, where Payment sends a visitor when it is paused.
 */
export function ServicesContact({
  form,
  limits,
}: {
  form: ReturnType<typeof useContactForm>;
  limits: FormLimits;
}) {
  const copy = useCopy(servicesCopy).cta;
  const mb = useCopy(mobaServicesCopy);
  const { features } = useLive();
  const { openChat } = useChat();
  const { data: services = [] } = useContentQuery('services');
  return (
    <MbSection
      id='contact-cta'
      kicker={mb.kickers.order}
      title={copy.title}
      lead={features.contactForm ? copy.hint : undefined}
      order={2}
      className='scroll-mt-4 pb-10'
    >
      {features.contactForm ? (
        <>
          <ServicesTopics
            services={services}
            topicId={form.topicId}
            onSelect={form.selectTopic}
          />
          <div role='status' aria-live='polite' className='sr-only'>
            {form.announcement}
          </div>
          <MbCard className='p-5 max-[719px]:p-4'>
            {form.status === 'sent' ? (
              <ServicesSent
                name={form.sentTo.name}
                email={form.sentTo.email}
                headingRef={form.headingRef}
                onAgain={form.reset}
              />
            ) : (
              <ServicesForm form={form} limits={limits} />
            )}
          </MbCard>
        </>
      ) : (
        <MbCard role='note' className='flex flex-col gap-1.5 p-5'>
          <p className='font-mb-display text-[22px] leading-tight font-bold mb-svc-title'>
            {copy.off.title}
          </p>
          <p className='text-[15px] leading-[1.6] text-mb-mute'>
            {copy.off.body}
          </p>
        </MbCard>
      )}
      {features.chat && (
        <p className='mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-[15px] text-mb-mute'>
          {copy.askPrefix}
          <MbButton
            variant='teal'
            size='sm'
            onClick={openChat}
            className='mb-focus-in'
          >
            <MessageCircle aria-hidden='true' className='size-3.5' />
            {copy.askButton}
          </MbButton>
        </p>
      )}
    </MbSection>
  );
}
