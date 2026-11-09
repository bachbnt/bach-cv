/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useChat } from '@/components/chat/chat-provider';
import {
  counterText,
  warnAt,
  type FormLimits,
} from '@/components/services/message-form';
import type { useContactForm } from '@/components/services/use-contact-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { servicesCopy } from '@/content/copy/services';
import { tradeDeskCopy } from '@/content/copy/trade-desk';
import { useLive } from '@/hooks/use-live';
import type { Doc } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import { DeskField } from '@/skins/trade/blocks/desk-field';
import { DeskTicketSent } from '@/skins/trade/blocks/desk-ticket-sent';
import { DeskTopicSegment } from '@/skins/trade/blocks/desk-topic-segment';
import { TvButton } from '@/skins/trade/ui/tv-button';
import { TV_FIELD } from '@/skins/trade/ui/tv-field';

/**
 * The contact form as the order ticket of the terminal, a panel that stays in view beside the catalogue. The topic is a segmented control, then
 * Name, Email and Message, and ONE Send button. The fields, validation, honeypot, states and announcement are the Standard `useContactForm`;
 * `#contact-cta` is this panel, which says the form is off when its switch is off.
 */
export function DeskTicket({
  form,
  limits,
  services,
  className,
}: {
  form: ReturnType<typeof useContactForm>;
  limits: FormLimits & { messageMax: number };
  services: Doc<'services'>[];
  className?: string;
}) {
  const copy = useCopy(servicesCopy);
  const desk = useCopy(tradeDeskCopy).services;
  const f = copy.form;
  const { features } = useLive();
  const { openChat } = useChat();
  const { values, errors, status, nameRef, emailRef, messageRef, sendRef } =
    form;
  const sending = status === 'sending';
  const used = values.message.length;

  return (
    <section
      id='contact-cta'
      aria-labelledby='tv-ticket-h'
      className={cn(
        'group/ticket relative scroll-mt-3 rounded-md border border-tv-line bg-tv-panel',
        className,
      )}
    >
      <span
        aria-hidden='true'
        className='pointer-events-none absolute -inset-px rounded opacity-0 shadow-[0_0_0_1px_var(--tv-accent),0_0_22px_color-mix(in_srgb,var(--tv-accent)_35%,transparent)] transition-opacity duration-160 group-focus-within/ticket:opacity-100'
      />
      <header
        aria-hidden='true'
        className='flex min-h-9 items-center gap-2 border-b border-tv-line px-3 py-1.5'
      >
        <span className='size-1.5 rounded-full bg-tv-accent' />
        <span className='text-[10px] font-bold tracking-wider text-tv-dim uppercase'>
          {desk.ticket}
        </span>
      </header>
      <div className='p-3'>
        <h2 id='tv-ticket-h' className='text-[15px]/snug font-bold'>
          {copy.cta.title}
        </h2>
        {features.contactForm ? (
          <>
            <p className='mt-1 mb-3 text-xs/[1.5] text-tv-mute'>
              {copy.cta.hint}
            </p>
            <div role='status' aria-live='polite' className='sr-only'>
              {form.announcement}
            </div>
            {status === 'sent' ? (
              <DeskTicketSent
                name={form.sentTo.name}
                email={form.sentTo.email}
                headingRef={form.headingRef}
                onAgain={form.reset}
              />
            ) : (
              <form
                noValidate
                aria-busy={sending}
                onSubmit={form.submit}
                className='flex flex-col gap-2'
              >
                {services.length > 0 && (
                  <DeskTopicSegment
                    services={services}
                    topicId={form.topicId}
                    onSelect={form.selectTopic}
                  />
                )}
                <DeskField id='f-name' label={f.name} error={errors.name}>
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
                    className={TV_FIELD}
                  />
                </DeskField>
                <DeskField id='f-email' label={f.email} error={errors.email}>
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
                    className={TV_FIELD}
                  />
                </DeskField>
                <DeskField
                  id='f-message'
                  label={f.message}
                  error={errors.message}
                  aside={
                    <span
                      className={cn(
                        'text-tv-mute tabular-nums',
                        used >= warnAt(limits.messageMax) &&
                          'font-semibold text-tv-down-ink',
                      )}
                    >
                      {counterText(used, limits.messageMax, f.count)}
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
                      TV_FIELD,
                      'min-h-[112px] field-sizing-fixed resize-y py-2',
                    )}
                  />
                </DeskField>
                {/* honeypot: people never see or reach it; a bot that fills it gets a pretend success */}
                <div
                  aria-hidden='true'
                  className='absolute -left-[9999px] h-px w-px overflow-hidden'
                >
                  <label>
                    {f.honeypot}
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
                    className='rounded border border-tv-down bg-tv-down-bg px-3 py-2 text-[13px]/[1.45] text-tv-down-ink'
                  >
                    {f.failed}
                  </div>
                )}
                <TvButton
                  ref={sendRef}
                  type='submit'
                  variant='primary'
                  disabled={sending}
                  className='h-10 w-full font-semibold'
                >
                  {sending ? (
                    <>
                      <span
                        aria-hidden='true'
                        className='size-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white'
                      />
                      {f.sending}
                    </>
                  ) : status === 'failed' ? (
                    f.retry
                  ) : (
                    f.send
                  )}
                </TvButton>
                <p className='text-xs/[1.45] text-tv-mute'>{f.note}</p>
              </form>
            )}
          </>
        ) : (
          <div
            role='note'
            className='mt-2 rounded border border-tv-line bg-tv-bg p-3'
          >
            <p className='text-[13px] font-bold'>{copy.cta.off.title}</p>
            <p className='mt-1 text-xs/[1.55] text-tv-mute'>
              {copy.cta.off.body}
            </p>
          </div>
        )}
        {features.chat && (
          <p className='mt-3 text-xs text-tv-mute'>
            {copy.cta.askPrefix}{' '}
            <button
              type='button'
              onClick={openChat}
              className='cursor-pointer font-medium text-tv-accent-ink underline-offset-[3px] hover:underline pointer-coarse:min-h-11'
            >
              {copy.cta.askButton}
            </button>
          </p>
        )}
      </div>
    </section>
  );
}
