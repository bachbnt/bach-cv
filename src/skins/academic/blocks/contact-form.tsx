/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { ContactField } from '@/skins/academic/blocks/contact-field';
import { lineInput } from '@/skins/academic/ui/ac-line-input';
import {
  counterText,
  warnAt,
  type FormLimits,
} from '@/components/services/message-form';
import type { useContactForm } from '@/components/services/use-contact-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { servicesCopy } from '@/content/copy/services';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import { AcButton } from '@/skins/academic/ui/ac-button';
import { AcIcon } from '@/skins/academic/ui/ac-icon';

/** The message form on a pinned sheet: name, email, message (ruled like a page of a notebook), the failure note and the Send pen. */
export function ContactForm({
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
      className='flex flex-col gap-3.5'
    >
      <div className='grid gap-x-5 gap-y-3.5 min-[561px]:grid-cols-2'>
        <ContactField id='f-name' label={copy.name} error={errors.name}>
          <Input
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
            className={lineInput}
          />
        </ContactField>
        <ContactField id='f-email' label={copy.email} error={errors.email}>
          <Input
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
            className={lineInput}
          />
        </ContactField>
      </div>
      <ContactField
        id='f-message'
        label={copy.message}
        error={errors.message}
        aside={
          <span
            className={cn(
              used >= warnAt(limits.messageMax) && 'font-bold text-ac-accent',
            )}
          >
            {counterText(used, limits.messageMax, copy.count)}
          </span>
        }
      >
        <Textarea
          id='f-message'
          ref={messageRef}
          name='message'
          maxLength={limits.messageMax}
          value={values.message}
          onChange={form.onField('message')}
          aria-invalid={!!errors.message}
          aria-describedby='f-message-error'
          className={cn(
            lineInput,
            'min-h-[160px] field-sizing-fixed resize-y border-b-0 bg-[repeating-linear-gradient(180deg,transparent_0_31px,var(--ac-ruling)_31px_32px)] px-0.5 py-0 leading-8 dark:bg-[repeating-linear-gradient(180deg,transparent_0_31px,var(--ac-ruling)_31px_32px)]',
          )}
        />
      </ContactField>
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
          className='border-l-[5px] border-ac-accent bg-ac-accent/10 px-3.5 py-2.5 text-[16px]/[1.4] text-ac-accent'
        >
          {copy.failed}
        </div>
      )}
      <div className='flex flex-wrap items-center gap-4'>
        <AcButton
          ref={sendRef}
          type='submit'
          disabled={sending}
          className='min-w-[140px] max-[560px]:w-full'
        >
          {sending ? (
            <>
              <span
                aria-hidden='true'
                className='size-4 animate-spin rounded-full border-[2.5px] border-ac-link/40 border-t-ac-link'
              />
              {copy.sending}
            </>
          ) : status === 'failed' ? (
            copy.retry
          ) : (
            <>
              {copy.send}
              <AcIcon name='pencil' />
            </>
          )}
        </AcButton>
      </div>
      <p className='font-ac-note text-[14.5px]/[1.4] text-ac-mute'>
        {copy.note}
      </p>
    </form>
  );
}
