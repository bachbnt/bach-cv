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
import { FIELD_CLASS, ServicesField } from '@/skins/moba/blocks/services-field';
import { MbButton } from '@/skins/moba/ui/mb-button';

/** The order form: name, email and message with their limits, the failure notice and the Send button (Send, Sending, Try again). */
export function ServicesForm({
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
      className='flex flex-col gap-4'
    >
      <div className='grid gap-4 min-[560px]:grid-cols-2'>
        <ServicesField id='mb-f-name' label={copy.name} error={errors.name}>
          <input
            id='mb-f-name'
            ref={nameRef}
            name='name'
            maxLength={limits.nameMax}
            autoComplete='name'
            enterKeyHint='next'
            value={values.name}
            onChange={form.onField('name')}
            aria-invalid={!!errors.name}
            aria-describedby='mb-f-name-error'
            className={FIELD_CLASS}
          />
        </ServicesField>
        <ServicesField id='mb-f-email' label={copy.email} error={errors.email}>
          <input
            id='mb-f-email'
            ref={emailRef}
            name='email'
            type='email'
            autoComplete='email'
            enterKeyHint='next'
            value={values.email}
            onChange={form.onField('email')}
            aria-invalid={!!errors.email}
            aria-describedby='mb-f-email-error'
            className={FIELD_CLASS}
          />
        </ServicesField>
      </div>
      <ServicesField
        id='mb-f-message'
        label={copy.message}
        error={errors.message}
        warn={used >= warnAt(limits.messageMax)}
        aside={counterText(used, limits.messageMax, copy.count)}
      >
        <textarea
          id='mb-f-message'
          ref={messageRef}
          name='message'
          maxLength={limits.messageMax}
          value={values.message}
          onChange={form.onField('message')}
          aria-invalid={!!errors.message}
          aria-describedby='mb-f-message-error'
          className={cn(FIELD_CLASS, 'min-h-[150px] resize-y')}
        />
      </ServicesField>
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
          className='border border-mb-red bg-mb-red/15 px-3.5 py-3 text-[14.5px] leading-[1.5] font-semibold text-mb-red-ink'
        >
          {copy.failed}
        </div>
      )}
      <div className='flex flex-wrap items-center gap-x-5 gap-y-3'>
        <MbButton
          ref={sendRef}
          type='submit'
          variant='gold'
          disabled={sending}
          className='mb-focus-in min-w-[150px] max-[559px]:w-full'
        >
          {sending ? (
            <>
              <span
                aria-hidden='true'
                data-testid='mb-spinner'
                className='mb-spin size-4 rounded-full'
              />
              {copy.sending}
            </>
          ) : (
            <>
              <Send aria-hidden='true' className='size-4' />
              {status === 'failed' ? copy.retry : copy.send}
            </>
          )}
        </MbButton>
        <p className='min-w-0 flex-1 basis-[220px] text-[13.5px] leading-[1.45] text-mb-mute'>
          {copy.note}
        </p>
      </div>
    </form>
  );
}
