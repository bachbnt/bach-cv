/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { FormField } from '@/components/services/form-field';
import {
  counterText,
  warnAt,
  type FormLimits,
} from '@/components/services/message-form';
import type { useContactForm } from '@/components/services/use-contact-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { servicesCopy } from '@/content/copy/services';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';

const control =
  'h-auto rounded-xl border-[1.5px] border-border bg-card px-3.5 py-3 text-base leading-[1.4] text-foreground focus-visible:border-foreground focus-visible:ring-foreground/10 aria-invalid:border-danger aria-invalid:ring-0 md:text-base';

/** The message form: name, email, message, the failure notice and the Send button. */
export function ContactForm({
  form,
  limits,
}: {
  form: ReturnType<typeof useContactForm>;
  limits: FormLimits & { messageMax: number };
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
      className='flex flex-col gap-[18px]'
    >
      <div className='flex flex-wrap gap-4'>
        <FormField
          id='f-name'
          label={copy.name}
          error={errors.name}
          className='flex-[1_1_200px]'
        >
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
            className={control}
          />
        </FormField>
        <FormField
          id='f-email'
          label={copy.email}
          error={errors.email}
          className='flex-[1_1_200px]'
        >
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
            className={control}
          />
        </FormField>
      </div>
      <FormField
        id='f-message'
        label={copy.message}
        error={errors.message}
        aside={
          <span
            className={cn(
              used >= warnAt(limits.messageMax) && 'font-semibold text-danger',
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
          className={cn(control, 'min-h-[140px] field-sizing-fixed resize-y')}
        />
      </FormField>
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
          className='rounded-xl border border-danger-border bg-danger-bg px-3.5 py-3 text-[15px] leading-[1.45] text-danger'
        >
          {copy.failed}
        </div>
      )}
      <div className='flex flex-wrap items-center gap-4 max-[720px]:block'>
        <Button
          ref={sendRef}
          type='submit'
          variant='brand'
          size='lg'
          disabled={sending}
          className='min-w-[140px] transition-transform hover:enabled:-translate-y-0.5 disabled:opacity-70 max-[720px]:w-full'
        >
          {sending ? (
            <>
              <span
                aria-hidden='true'
                className='size-4 animate-spin rounded-full border-[2.5px] border-white/40 border-t-white'
              />
              {copy.sending}
            </>
          ) : status === 'failed' ? (
            copy.retry
          ) : (
            copy.send
          )}
        </Button>
      </div>
      <p className='text-[13.5px] leading-[1.45] text-muted-foreground'>
        {copy.note}
      </p>
    </form>
  );
}
