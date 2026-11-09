/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Send } from 'lucide-react';
import {
  counterText,
  warnAt,
  type FormLimits,
} from '@/components/services/message-form';
import type { useContactForm } from '@/components/services/use-contact-form';
import { servicesCopy } from '@/content/copy/services';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import {
  BOOKING_CONTROL,
  BookingField,
} from '@/skins/travel/blocks/booking-field';
import { READABLE_SOLID } from '@/skins/travel/blocks/solid-button';
import { TlButton } from '@/skins/travel/ui/tl-button';

/**
 * The booking form: name, email and message, the failure notice and the Send button. All behaviour (validation, limits, the topic's
 * starting sentence, the honeypot, the send flow and the retry) is the Standard `useContactForm`; this is only its face.
 */
export function BookingForm({
  form,
  limits,
}: {
  form: ReturnType<typeof useContactForm>;
  limits: FormLimits;
}) {
  const copy = useCopy(servicesCopy).form;
  const { values, errors, status, nameRef, emailRef, messageRef, sendRef } =
    form;
  const sending = status === 'sending';
  const used = values.message.length;

  return (
    <form
      noValidate
      aria-busy={sending}
      onSubmit={form.submit}
      className='flex flex-col gap-1'
    >
      <BookingField id='f-name' label={copy.name} error={errors.name}>
        <input
          id='f-name'
          ref={nameRef}
          name='name'
          maxLength={limits.nameMax}
          autoComplete='name'
          enterKeyHint='next'
          value={values.name}
          onChange={form.onField('name')}
          aria-invalid={!!errors.name}
          aria-describedby='f-name-error'
          className={BOOKING_CONTROL}
        />
      </BookingField>
      <BookingField id='f-email' label={copy.email} error={errors.email}>
        <input
          id='f-email'
          ref={emailRef}
          name='email'
          type='email'
          autoComplete='email'
          enterKeyHint='next'
          value={values.email}
          onChange={form.onField('email')}
          aria-invalid={!!errors.email}
          aria-describedby='f-email-error'
          className={BOOKING_CONTROL}
        />
      </BookingField>
      <BookingField
        id='f-message'
        label={copy.message}
        error={errors.message}
        aside={
          <span
            className={cn(
              'text-tl-muted',
              used >= warnAt(limits.messageMax) && 'font-bold text-tl-danger',
            )}
          >
            {counterText(used, limits.messageMax, copy.count)}
          </span>
        }
      >
        <textarea
          id='f-message'
          ref={messageRef}
          name='message'
          maxLength={limits.messageMax}
          value={values.message}
          onChange={form.onField('message')}
          aria-invalid={!!errors.message}
          aria-describedby='f-message-error'
          className={cn(BOOKING_CONTROL, 'min-h-[112px] resize-y')}
        />
      </BookingField>
      {/* honeypot: people never see or reach it; a bot that fills it gets a pretend success */}
      <div
        aria-hidden='true'
        className='absolute -left-[9999px] h-px w-px overflow-hidden'
      >
        <label>
          {copy.honeypot}
          <input
            type='text'
            name='website'
            tabIndex={-1}
            autoComplete='off'
            value={values.honeypot}
            onChange={(e) => form.setHoneypot(e.target.value)}
          />
        </label>
      </div>
      {status === 'failed' && (
        <div
          role='alert'
          className='mb-2 rounded-xl border border-tl-danger bg-tl-coral-2 px-3 py-2.5 text-[13px] leading-[1.45] text-tl-ink'
        >
          {copy.failed}
        </div>
      )}
      <TlButton
        ref={sendRef}
        type='submit'
        variant='solid'
        disabled={sending}
        className={cn(READABLE_SOLID, 'w-full disabled:opacity-70')}
      >
        {sending ? (
          <>
            <span
              aria-hidden='true'
              className='size-4 animate-spin rounded-full border-[2.5px] border-white/40 border-t-white'
            />
            {copy.sending}
          </>
        ) : (
          <>
            <Send aria-hidden='true' />
            {status === 'failed' ? copy.retry : copy.send}
          </>
        )}
      </TlButton>
      <p className='m-0 mt-2 text-[12px] leading-[1.45] text-tl-muted'>
        {copy.note}
      </p>
    </form>
  );
}
