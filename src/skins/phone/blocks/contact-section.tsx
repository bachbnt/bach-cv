/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { MessageCircle } from 'lucide-react';
import { useChat } from '@/components/chat/chat-provider';
import type { FormLimits } from '@/components/services/message-form';
import type { useContactForm } from '@/components/services/use-contact-form';
import { servicesCopy } from '@/content/copy/services';
import { useLive } from '@/hooks/use-live';
import { useCopy } from '@/lib/i18n/copy';
import { useContentQuery } from '@/lib/query/use-content';
import { ContactForm } from '@/skins/phone/blocks/contact-form';
import { ContactSent } from '@/skins/phone/blocks/contact-sent';
import { ContactTopics } from '@/skins/phone/blocks/contact-topics';
import { ContactTopicsSkeleton } from '@/skins/phone/blocks/contact-topics-skeleton';
import { PhButton } from '@/skins/phone/ui/ph-button';
import { PhCard } from '@/skins/phone/ui/ph-card';
import { HINGE_PANES } from '@/skins/phone/blocks/hinge-panes';
import { cn } from '@/lib/utils';

/**
 * "What do you want to build?": the hint, the topic chips and Ask BB Bot, with the message form beside them on a tablet and below them on a
 * phone. The target of `#contact-cta`. When the contact form is switched off the form and the chips give way to a note.
 */
export function ContactSection({
  form,
  limits,
}: {
  form: ReturnType<typeof useContactForm>;
  limits: FormLimits;
}) {
  const copy = useCopy(servicesCopy).cta;
  const { features } = useLive();
  const { openChat } = useChat();
  const { data: services = [], isPending } = useContentQuery('services');

  return (
    <section
      id='contact-cta'
      aria-labelledby='ph-cta-h'
      className={cn(
        'mt-10 grid scroll-mt-2 items-start gap-6 @min-[900px]:grid-cols-2 @min-[900px]:gap-8',
        HINGE_PANES,
      )}
    >
      {/* the status bar and the app bar lie over the page, which scrolls under them: the column stops where the first content starts, `--ph-bars` */}
      <div className='flex min-w-0 flex-col gap-4 @min-[900px]:sticky @min-[900px]:top-[calc(var(--ph-bar-shown,var(--ph-bars))+1rem)]'>
        <h2
          id='ph-cta-h'
          className='text-[26px]/[1.15] font-extrabold tracking-[-0.01em]'
        >
          {copy.title}
        </h2>
        {features.contactForm ? (
          <>
            <p className='text-[16px]/[1.55] text-ph-mute'>{copy.hint}</p>
            {isPending ? (
              <ContactTopicsSkeleton />
            ) : (
              <ContactTopics
                services={services}
                topicId={form.topicId}
                onSelect={form.selectTopic}
              />
            )}
          </>
        ) : (
          <PhCard role='note' className='flex flex-col gap-1.5 p-5'>
            <p className='text-[17px]/[1.3] font-bold'>{copy.off.title}</p>
            <p className='text-[15px]/[1.5] text-ph-mute'>{copy.off.body}</p>
          </PhCard>
        )}
        {features.chat && (
          <div className='flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px] text-ph-mute'>
            <span>{copy.askPrefix}</span>
            <PhButton variant='ghost' onClick={openChat} className='-ml-2'>
              <MessageCircle aria-hidden='true' className='size-4' />
              {copy.askButton}
            </PhButton>
          </div>
        )}
      </div>
      {features.contactForm && (
        <div className='min-w-0'>
          <div role='status' aria-live='polite' className='sr-only'>
            {form.announcement}
          </div>
          <PhCard className='p-5 @min-[900px]:p-6'>
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
          </PhCard>
        </div>
      )}
    </section>
  );
}
