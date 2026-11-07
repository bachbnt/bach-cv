/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import type { FormLimits } from '@/components/services/message-form';
import type { useContactForm } from '@/components/services/use-contact-form';
import { useChat } from '@/components/chat/chat-provider';
import { servicesCopy } from '@/content/copy/services';
import { useLive } from '@/hooks/use-live';
import type { Doc } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { LibraryComposerForm } from '@/skins/stream/blocks/library-composer-form';
import { LibraryCommentSent } from '@/skins/stream/blocks/library-comment-sent';
import { StreamChip } from '@/skins/stream/ui/stream-chip';

/**
 * The comment composer of the Community tab, which is also the contact form of Standard: its title and hint, the topic chips that
 * start the message, the box that sends it (and the comment it becomes once sent), and the way to ask BB Bot. With the form switched
 * off it says so. It is `#contact-cta`, where the empty Payment page sends the visitor.
 */
export function LibraryComposer({
  form,
  limits,
  services,
}: {
  form: ReturnType<typeof useContactForm>;
  limits: FormLimits;
  services: Doc<'services'>[];
}) {
  const copy = useCopy(servicesCopy).cta;
  const { features } = useLive();
  const { openChat } = useChat();

  return (
    <section
      id='contact-cta'
      aria-labelledby='cta-h'
      className='scroll-mt-20 rounded-2xl border border-sm-line bg-sm-bg p-4 min-[701px]:p-5 [@media(min-height:760px)]:min-[1001px]:sticky [@media(min-height:760px)]:min-[1001px]:top-20'
    >
      <h2 id='cta-h' className='text-xl/[1.3] font-bold'>
        {copy.title}
      </h2>
      {features.contactForm ? (
        <>
          <p className='mt-1 text-sm/[1.5] text-sm-mute'>{copy.hint}</p>
          <div
            role='group'
            aria-label={copy.topicLabel}
            className='mt-4 flex flex-wrap gap-2'
          >
            {services.map((service) => (
              <StreamChip
                key={service.id}
                aria-pressed={service.id === form.topicId}
                onClick={() => form.selectTopic(service)}
              >
                {service.name}
              </StreamChip>
            ))}
          </div>
          <div role='status' aria-live='polite' className='sr-only'>
            {form.announcement}
          </div>
          <div className='mt-5 border-t border-sm-line pt-5'>
            {form.status === 'sent' ? (
              <LibraryCommentSent
                name={form.sentTo.name}
                email={form.sentTo.email}
                message={form.values.message}
                headingRef={form.headingRef}
                onAgain={form.reset}
              />
            ) : (
              <LibraryComposerForm form={form} limits={limits} />
            )}
          </div>
        </>
      ) : (
        <div role='note' className='mt-3'>
          <p className='text-base font-bold'>{copy.off.title}</p>
          <p className='mt-1 text-sm/[1.5] text-sm-mute'>{copy.off.body}</p>
        </div>
      )}
      {features.chat && (
        <p className='mt-4 text-sm/[1.5] text-sm-mute'>
          {copy.askPrefix}{' '}
          <button
            type='button'
            onClick={openChat}
            className='cursor-pointer text-sm font-medium text-sm-blue hover:underline pointer-coarse:min-h-11'
          >
            {copy.askButton}
          </button>
        </p>
      )}
    </section>
  );
}
