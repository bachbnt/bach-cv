/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { useChat } from '@/components/chat/chat-provider';
import { useContactForm } from '@/components/services/use-contact-form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { servicesCopy } from '@/content/copy/services';
import { useLive } from '@/hooks/use-live';
import { settingsSchema } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { settingsQueryOptions } from '@/lib/query/options';
import { useContentQuery } from '@/lib/query/use-content';
import { cn } from '@/lib/utils';
import { ContactForm } from '@/skins/dev/blocks/contact-form';
import { ContactSent } from '@/skins/dev/blocks/contact-sent';
import { TopicChips } from '@/skins/dev/blocks/topic-chips';
import { DevLinkButton } from '@/skins/dev/ui/dev-link';

/** Until the settings arrive the form uses the schema defaults. */
const DEFAULT_LIMITS = settingsSchema.parse({}).contactForm;

/** "What do you want to build?": topic chips on the left, the message form on the right. The target of `#contact-cta`. */
export function ContactSection() {
  const copy = useCopy(servicesCopy).cta;
  const { features } = useLive();
  const { openChat } = useChat();
  const { data: services = [] } = useContentQuery('services');
  const { data: settings } = useQuery(settingsQueryOptions());
  const limits = settings?.contactForm ?? DEFAULT_LIMITS;
  const form = useContactForm(limits);

  return (
    <div
      id='contact-cta'
      className={cn(
        'grid scroll-mt-6 grid-cols-[1fr_1.1fr] items-start gap-[26px] max-[900px]:grid-cols-[1fr]',
        !features.contactForm && 'grid-cols-[1fr]',
      )}
      data-reveal
    >
      <div className='min-w-0'>
        <h2 className='mb-2! text-[27px]'>{copy.title}</h2>
        {features.contactForm ? (
          <>
            <p className='text-mute'>{copy.hint}</p>
            <TopicChips
              services={services}
              topicId={form.topicId}
              onSelect={form.selectTopic}
            />
          </>
        ) : (
          <Alert
            role='note'
            className='mt-4 flex max-w-[740px] items-start gap-2.5 rounded-[8px] border-dashed border-line-2 bg-chrome px-[17px] py-[13px] font-sans text-[14.5px]/[1.6] text-mute'
          >
            <AlertTitle className='mb-1 font-code text-[15px] leading-[normal] font-semibold text-head'>
              {copy.off.title}
            </AlertTitle>
            <AlertDescription>{copy.off.body}</AlertDescription>
          </Alert>
        )}
        {features.chat && (
          <p className='text-[15px] text-mute'>
            {copy.askPrefix}{' '}
            <DevLinkButton
              className='pointer-coarse:min-h-11'
              onClick={openChat}
            >
              {copy.askButton}
            </DevLinkButton>
          </p>
        )}
      </div>
      {features.contactForm && (
        <div className='min-w-0'>
          <div role='status' aria-live='polite' className='sr-only'>
            {form.announcement}
          </div>
          {form.status === 'sent' ? (
            <ContactSent
              name={form.sentTo.name}
              email={form.sentTo.email}
              headingRef={form.headingRef}
              onAgain={form.reset}
            />
          ) : (
            <ContactForm form={form} limits={limits} />
          )}
        </div>
      )}
    </div>
  );
}
