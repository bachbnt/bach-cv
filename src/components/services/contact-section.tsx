/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useChat } from '@/components/chat/chat-provider';
import { ContactForm } from '@/components/services/contact-form';
import { ContactSent } from '@/components/services/contact-sent';
import { TopicChips } from '@/components/services/topic-chips';
import { useContactForm } from '@/components/services/use-contact-form';
import { servicesCopy } from '@/content/copy/services';
import { useCopy } from '@/lib/i18n/copy';
import { useContactLimits } from '@/hooks/use-contact-limits';
import { useLive } from '@/hooks/use-live';
import { useContentQuery } from '@/lib/query/use-content';

/** "What do you want to build?": topic chips on the left, the message form on the right. */
export function ContactSection() {
  const copy = useCopy(servicesCopy).cta;
  const { features } = useLive();
  const { openChat } = useChat();
  const { data: services = [] } = useContentQuery('services');
  const limits = useContactLimits();
  const form = useContactForm(limits);

  return (
    <section
      id='contact-cta'
      aria-labelledby='cta-h'
      className='scroll-mt-4 bg-secondary py-24 text-foreground max-[720px]:py-16'
    >
      <div className='mx-auto flex w-full max-w-[1200px] flex-wrap items-start gap-x-16 gap-y-12 px-5 min-[721px]:px-12'>
        <div className='flex min-w-0 flex-[1_1_380px] flex-col gap-5'>
          <h2
            id='cta-h'
            className='text-[30px] leading-[1.1] min-[721px]:text-[40px]'
          >
            {copy.title}
          </h2>
          {features.contactForm ? (
            <>
              <p className='text-base leading-[1.5] text-muted-foreground'>
                {copy.hint}
              </p>
              <TopicChips
                services={services}
                topicId={form.topicId}
                onSelect={form.selectTopic}
              />
            </>
          ) : (
            <div
              role='note'
              className='glow lift flex flex-col gap-1.5 rounded-2xl border border-border bg-card p-6'
            >
              <p className='font-heading text-xl font-bold'>{copy.off.title}</p>
              <p className='leading-[1.55] text-body'>{copy.off.body}</p>
            </div>
          )}
          {features.chat && (
            <p className='text-base leading-[1.5] text-muted-foreground'>
              {copy.askPrefix}{' '}
              <button
                type='button'
                onClick={openChat}
                className='text-[15px] font-medium text-foreground underline underline-offset-4 hover:text-brand-ink active:text-brand-ink max-[720px]:inline-flex max-[720px]:min-h-11 max-[720px]:items-center pointer-coarse:min-h-11'
              >
                {copy.askButton}
              </button>
            </p>
          )}
        </div>
        {features.contactForm && (
          <div className='min-w-0 flex-[1_1_440px]'>
            <div role='status' aria-live='polite' className='sr-only'>
              {form.announcement}
            </div>
            <div className='glow rounded-2xl border border-border bg-card p-8 max-[720px]:px-5 max-[720px]:py-6'>
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
          </div>
        )}
      </div>
    </section>
  );
}
