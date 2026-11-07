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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { servicesCopy } from '@/content/copy/services';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import { LibraryVisitorAvatar } from '@/skins/stream/blocks/library-visitor-avatar';
import { StreamButton } from '@/skins/stream/ui/stream-button';

/** A field of the composer has no box, only a line under the text: ink when it has the focus, red when it is wrong. */
const control =
  'h-auto rounded-none border-0 border-b border-sm-hover2 bg-transparent px-0 pt-1 pb-2 text-sm text-sm-ink shadow-none focus-visible:border-sm-ink focus-visible:ring-0 aria-invalid:border-sm-red-ink aria-invalid:ring-0 dark:bg-transparent md:text-sm';

/**
 * The message form as the box for a new comment: the visitor's avatar, then name, email and message (same fields, limits and
 * errors as Standard, from `useContactForm`), the failure notice and the Send button that reads Try again after a failure.
 */
export function LibraryComposerForm({
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
      className='flex gap-3'
    >
      <LibraryVisitorAvatar name={values.name} />
      <div className='flex min-w-0 flex-1 flex-col gap-3'>
        <div className='flex flex-wrap gap-x-4'>
          <FormField
            id='f-name'
            label={copy.name}
            error={errors.name}
            className='flex-[1_1_160px]'
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
            className='flex-[1_1_160px]'
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
                used >= warnAt(limits.messageMax) &&
                  'font-medium text-sm-red-ink',
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
            className={cn(control, 'min-h-[104px] field-sizing-fixed resize-y')}
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
            className='rounded-lg border border-danger-border bg-danger-bg px-3.5 py-3 text-sm/[1.45] text-danger'
          >
            {copy.failed}
          </div>
        )}
        <div className='flex flex-wrap items-center justify-between gap-x-4 gap-y-3'>
          <p className='min-w-[180px] flex-1 text-[13px]/[1.45] text-sm-mute'>
            {copy.note}
          </p>
          <StreamButton
            ref={sendRef}
            type='submit'
            variant='blue'
            disabled={sending}
            className='min-w-24 max-[480px]:w-full'
          >
            {sending ? (
              <>
                <span
                  aria-hidden='true'
                  className='size-4 animate-spin rounded-full border-2 border-sm-bg/40 border-t-sm-bg'
                />
                {copy.sending}
              </>
            ) : status === 'failed' ? (
              copy.retry
            ) : (
              copy.send
            )}
          </StreamButton>
        </div>
      </div>
    </form>
  );
}
