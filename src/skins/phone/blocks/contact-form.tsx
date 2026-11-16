/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { CircleAlert, Send } from 'lucide-react';
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
import {
  ContactField,
  contactControl,
} from '@/skins/phone/blocks/contact-field';
import { PhButton } from '@/skins/phone/ui/ph-button';

/** The message form: name, email, message, the failure note and Send. Same fields, limits and states as Standard (they come from its hook). */
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
      className='flex flex-col gap-3'
    >
      <ContactField id='f-name' label={copy.name} error={errors.name}>
        <Input
          id='f-name'
          ref={nameRef}
          name='name'
          maxLength={limits.nameMax}
          placeholder=' '
          inputMode='text'
          autoComplete='name'
          autoCapitalize='words'
          spellCheck={false}
          enterKeyHint='next'
          value={values.name}
          onChange={form.onField('name')}
          aria-invalid={!!errors.name}
          aria-describedby='f-name-error'
          className={contactControl}
        />
      </ContactField>
      <ContactField id='f-email' label={copy.email} error={errors.email}>
        <Input
          id='f-email'
          ref={emailRef}
          name='email'
          type='email'
          placeholder=' '
          inputMode='email'
          autoComplete='email'
          autoCapitalize='none'
          autoCorrect='off'
          spellCheck={false}
          enterKeyHint='next'
          value={values.email}
          onChange={form.onField('email')}
          aria-invalid={!!errors.email}
          aria-describedby='f-email-error'
          className={contactControl}
        />
      </ContactField>
      <ContactField
        id='f-message'
        label={copy.message}
        error={errors.message}
        aside={
          <span
            className={cn(
              'shrink-0 tabular-nums',
              used >= warnAt(limits.messageMax) &&
                'font-semibold text-ph-danger',
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
          placeholder=' '
          inputMode='text'
          autoComplete='off'
          enterKeyHint='enter'
          value={values.message}
          onChange={form.onField('message')}
          aria-invalid={!!errors.message}
          aria-describedby='f-message-error'
          className={cn(
            contactControl,
            'h-auto min-h-40 field-sizing-fixed resize-y pt-6 pb-3 leading-[1.5]',
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
          className='flex items-start gap-3 rounded-ph-inner border border-ph-danger/50 bg-ph-danger/10 px-4 py-3 text-[15px]/[1.45] text-ph-ink'
        >
          <CircleAlert
            aria-hidden='true'
            className='mt-0.5 size-5 shrink-0 text-ph-danger'
          />
          {copy.failed}
        </div>
      )}
      <PhButton
        ref={sendRef}
        type='submit'
        variant='solid'
        disabled={sending}
        className='h-12 w-full text-[16px] @min-[900px]:w-fit @min-[900px]:min-w-44'
      >
        {sending ? (
          <>
            <span
              aria-hidden='true'
              className='size-4 animate-spin rounded-full border-[2.5px] border-ph-on-accent/40 border-t-ph-on-accent'
            />
            {copy.sending}
          </>
        ) : status === 'failed' ? (
          copy.retry
        ) : (
          <>
            {copy.send}
            <Send aria-hidden='true' className='size-4' />
          </>
        )}
      </PhButton>
      <p className='text-[14px]/[1.5] text-ph-mute'>{copy.note}</p>
    </form>
  );
}
