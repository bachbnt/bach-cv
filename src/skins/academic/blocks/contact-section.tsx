/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useChat } from '@/components/chat/chat-provider';
import type { useContactForm } from '@/components/services/use-contact-form';
import { servicesCopy } from '@/content/copy/services';
import { useContactLimits } from '@/hooks/use-contact-limits';
import { useLive } from '@/hooks/use-live';
import { useCopy } from '@/lib/i18n/copy';
import { useContentQuery } from '@/lib/query/use-content';
import { ContactForm } from '@/skins/academic/blocks/contact-form';
import { ContactSent } from '@/skins/academic/blocks/contact-sent';
import { ContactTopics } from '@/skins/academic/blocks/contact-topics';
import { AcPaper } from '@/skins/academic/ui/ac-paper';
import { AcHeading } from '@/skins/academic/ui/ac-section';

/**
 * "What do you want to build?": the hint on a sticky note and the topic chips on the board, the message form on a pinned sheet. The target of
 * `#contact-cta`. When the contact form is switched off the sheet and the chips give way to a note.
 */
export function ContactSection({
  form,
}: {
  form: ReturnType<typeof useContactForm>;
}) {
  const copy = useCopy(servicesCopy).cta;
  const { features } = useLive();
  const { openChat } = useChat();
  const { data: services = [] } = useContentQuery('services');
  const limits = useContactLimits();

  return (
    <section
      id='contact-cta'
      aria-labelledby='ac-cta-h'
      className='mt-14 grid scroll-mt-6 items-start gap-x-12 gap-y-9 min-[900px]:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]'
    >
      <div className='min-w-0'>
        <AcHeading id='ac-cta-h'>{copy.title}</AcHeading>
        {features.contactForm ? (
          <>
            <AcPaper kind='sticky' className='mt-6'>
              <p>{copy.hint}</p>
            </AcPaper>
            <ContactTopics
              services={services}
              topicId={form.topicId}
              onSelect={form.selectTopic}
            />
          </>
        ) : (
          <AcPaper kind='sticky' role='note' className='mt-6'>
            <p className='font-ac-note text-[22px]/[1.1] font-bold'>
              {copy.off.title}
            </p>
            <p className='mt-1.5'>{copy.off.body}</p>
          </AcPaper>
        )}
        {features.chat && (
          <p className='mt-5 text-ac-mute'>
            {copy.askPrefix}{' '}
            <button
              type='button'
              onClick={openChat}
              className='cursor-pointer font-ac-note text-[18px] text-ac-link underline underline-offset-4 pointer-coarse:min-h-11'
            >
              {copy.askButton}
            </button>
          </p>
        )}
      </div>
      {features.contactForm && (
        <div className='min-w-0'>
          <div role='status' aria-live='polite' className='sr-only'>
            {form.announcement}
          </div>
          <AcPaper kind='pinned' className='px-7 pt-8 pb-5 max-[560px]:px-5'>
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
          </AcPaper>
        </div>
      )}
    </section>
  );
}
