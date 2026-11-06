/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import type { KeyboardEvent } from 'react';
import {
  counterText,
  warnAt,
  type FormLimits,
} from '@/components/services/message-form';
import type { useContactForm } from '@/components/services/use-contact-form';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { servicesCopy } from '@/content/copy/services';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import { FormField } from '@/skins/dev/blocks/form-field';
import { useSubmitKeyLabel } from '@/skins/dev/blocks/use-submit-key-label';
import { devButtonVariants } from '@/skins/dev/ui/dev-button';
import { DevKbd } from '@/skins/dev/ui/dev-kbd';

/** The inputs of the form: the editor's field (shadcn Input and Textarea, in the palette), its focus line a pixel thin. */
const control =
  'h-auto rounded-[4px] border-line-2 bg-editor px-3 py-2.5 font-code text-[14.5px]/[1.4] text-head focus:border-signal! focus:outline-1! focus:outline-solid focus:outline-signal focus-visible:ring-0 aria-invalid:border-err aria-invalid:ring-0 md:text-[14.5px]/[1.4] dark:bg-editor dark:aria-invalid:border-err';

/** The message form: name, email, message, the failure notice and the Send button. */
export function ContactForm({
  form,
  limits,
}: {
  form: ReturnType<typeof useContactForm>;
  limits: FormLimits & { messageMax: number };
}) {
  const copy = useCopy(servicesCopy).form;
  const submitKey = useSubmitKeyLabel();
  const { values, errors, status, nameRef, emailRef, messageRef, sendRef } =
    form;
  const sending = status === 'sending';
  const used = values.message.length;

  const sendOnModEnter = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  };

  return (
    <form
      noValidate
      aria-busy={sending}
      onSubmit={form.submit}
      className='relative grid gap-3.5 rounded-[8px] border border-line-2 bg-chrome p-5'
    >
      <FieldGroup className='gap-3.5 *:data-[slot=field-group]:gap-3.5'>
        <FieldGroup className='grid grid-cols-[1fr_1fr] max-[900px]:grid-cols-[1fr]'>
          <FormField id='f-name' label={copy.name} error={errors.name}>
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
              aria-describedby={errors.name ? 'f-name-error' : undefined}
              className={control}
            />
          </FormField>
          <FormField id='f-email' label={copy.email} error={errors.email}>
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
              aria-describedby={errors.email ? 'f-email-error' : undefined}
              className={control}
            />
          </FormField>
        </FieldGroup>
        <FormField
          id='f-message'
          label={copy.message}
          error={errors.message}
          aside={
            <FieldDescription
              className={cn(
                'justify-self-end font-code text-[12px] leading-[normal]',
                // `dv-warn` is only a hook for the tests
                used >= warnAt(limits.messageMax)
                  ? 'dv-warn text-fn'
                  : 'text-mute',
              )}
            >
              {counterText(used, limits.messageMax, copy.count)}
            </FieldDescription>
          }
        >
          <Textarea
            id='f-message'
            ref={messageRef}
            name='message'
            rows={5}
            maxLength={limits.messageMax}
            value={values.message}
            onChange={form.onField('message')}
            onKeyDown={sendOnModEnter}
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? 'f-message-error' : undefined}
            className={cn(control, 'field-sizing-fixed min-h-28 resize-y')}
          />
        </FormField>
        <Field
          aria-hidden='true'
          className='absolute -left-[9999px] h-px w-px overflow-hidden'
        >
          <FieldLabel>
            {copy.honeypot}
            <Input
              type='text'
              name='website'
              tabIndex={-1}
              autoComplete='off'
              value={values.honeypot}
              onChange={(e) => form.setHoneypot(e.target.value)}
            />
          </FieldLabel>
        </Field>
        {status === 'failed' && (
          <Alert
            variant='destructive'
            className='rounded-[4px] border-err bg-[color-mix(in_srgb,var(--red)_10%,transparent)] px-3 py-2.5 font-sans text-[14px]/[1.5]'
          >
            <AlertDescription>{copy.failed}</AlertDescription>
          </Alert>
        )}
        <Field
          orientation='horizontal'
          className='mt-0.5 flex-wrap gap-4 border-t border-line pt-1'
        >
          <Button
            ref={sendRef}
            type='submit'
            variant='brand'
            disabled={sending}
            data-slot='dev-button'
            className={cn(
              devButtonVariants({ variant: 'solid' }),
              'gap-2.5 pr-3.5 pl-3 disabled:cursor-progress disabled:opacity-85 disabled:saturate-70 max-[900px]:w-full max-[900px]:justify-center',
            )}
          >
            {sending ? (
              <Spinner
                data-icon='inline-start'
                aria-hidden='true'
                className='m-[3px]'
              />
            ) : (
              <span
                className='grid size-[22px] place-items-center rounded-[5px] bg-[rgba(255,255,255,0.18)] text-[11px] transition-[transform] duration-[250ms] ease-[ease] group-hover/button:[transform:translateX(3px)]'
                aria-hidden='true'
              >
                ➤
              </span>
            )}
            <span>
              {sending
                ? copy.sending
                : status === 'failed'
                  ? copy.retry
                  : copy.send}
            </span>
            <DevKbd variant='send' aria-hidden='true'>
              {submitKey}
            </DevKbd>
          </Button>
          <FieldDescription className='m-0 min-w-[200px] flex-1 font-sans text-[13px]/[1.5] text-mute'>
            {copy.note}
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
