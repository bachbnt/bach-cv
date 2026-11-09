/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Check } from 'lucide-react';
import type { Ref } from 'react';
import { useChat } from '@/components/chat/chat-provider';
import { fill, type FormLimits } from '@/components/services/message-form';
import type { useContactForm } from '@/components/services/use-contact-form';
import { servicesCopy } from '@/content/copy/services';
import { travelPostcardsCopy } from '@/content/copy/travel-postcards';
import { useLive } from '@/hooks/use-live';
import { useCopy } from '@/lib/i18n/copy';
import { BookingForm } from '@/skins/travel/blocks/booking-form';
import { TlKicker } from '@/skins/travel/ui/tl-kicker';

/** Shown in place of the form once the message is sent: a "booked" stamp, the thanks, and a way to write another. The heading takes focus so screen readers land on it. */
function BookedNote({
  name,
  email,
  headingRef,
  onAgain,
}: {
  name: string;
  email: string;
  headingRef: Ref<HTMLHeadingElement>;
  onAgain: () => void;
}) {
  const copy = useCopy(servicesCopy).sent;
  const words = useCopy(travelPostcardsCopy).tours;
  return (
    <div className='flex flex-col items-start gap-2.5 py-1'>
      <span
        aria-hidden='true'
        className='tl-stamp grid size-14 [--r:-8deg] place-items-center rounded-full border-[3px] border-double border-tl-teal text-tl-teal'
      >
        <Check className='size-7' strokeWidth={2.6} />
      </span>
      <TlKicker className='text-tl-teal'>{words.sentKicker}</TlKicker>
      <h3
        ref={headingRef}
        tabIndex={-1}
        className='m-0 -mt-1.5 text-[19px] leading-[1.2] font-extrabold focus:outline-none focus-visible:rounded focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-tl-coral'
      >
        {copy.title}
      </h3>
      <p className='m-0 text-[13.5px] leading-[1.5] text-tl-muted'>
        {fill(copy.body, { name, email })}
      </p>
      <button
        type='button'
        onClick={onAgain}
        className='cursor-pointer text-[13.5px] font-bold text-tl-ink underline underline-offset-4 pointer-coarse:min-h-11'
      >
        {copy.again}
      </button>
    </div>
  );
}

/**
 * The booking form: the heading and hint, the way to ask BB Bot, and the form (or the "booked" note once it is sent). With
 * `features.contactForm` off the form is replaced by a note, as in Standard. The target of `#contact-cta`.
 */
export function BookingSection({
  form,
  limits,
}: {
  form: ReturnType<typeof useContactForm>;
  limits: FormLimits;
}) {
  const copy = useCopy(servicesCopy).cta;
  const words = useCopy(travelPostcardsCopy).tours;
  const { features } = useLive();
  const { openChat } = useChat();

  return (
    <section
      id='contact-cta'
      aria-labelledby='tl-booking-title'
      className='scroll-mt-4 rounded-2xl bg-tl-chip p-4'
    >
      <TlKicker className='text-tl-chip-ink'>{words.bookingKicker}</TlKicker>
      <h2
        id='tl-booking-title'
        className='m-0 text-[17px] leading-[1.25] font-extrabold text-tl-chip-ink'
      >
        {copy.title}
      </h2>
      {features.contactForm ? (
        <p className='m-0 mt-1 text-[13px] leading-[1.45] text-tl-muted'>
          {copy.hint}
        </p>
      ) : (
        <div
          role='note'
          className='mt-3 rounded-xl border border-tl-line bg-tl-panel p-3.5'
        >
          <p className='m-0 text-[15px] font-extrabold'>{copy.off.title}</p>
          <p className='m-0 mt-1 text-[13.5px] leading-[1.5] text-tl-muted'>
            {copy.off.body}
          </p>
        </div>
      )}
      {features.chat && (
        <p className='m-0 mt-2 text-[13px] leading-[1.45] text-tl-muted'>
          {copy.askPrefix}{' '}
          <button
            type='button'
            onClick={openChat}
            className='cursor-pointer font-bold text-tl-ink underline underline-offset-4 pointer-coarse:min-h-11'
          >
            {copy.askButton}
          </button>
        </p>
      )}
      {features.contactForm && (
        <div className='mt-3'>
          <div role='status' aria-live='polite' className='sr-only'>
            {form.announcement}
          </div>
          <div className='rounded-2xl border border-tl-line bg-tl-panel p-3.5'>
            {form.status === 'sent' ? (
              <BookedNote
                name={form.sentTo.name}
                email={form.sentTo.email}
                headingRef={form.headingRef}
                onAgain={form.reset}
              />
            ) : (
              <BookingForm form={form} limits={limits} />
            )}
          </div>
        </div>
      )}
    </section>
  );
}
