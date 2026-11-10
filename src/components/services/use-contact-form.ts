/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react';
import { servicesCopy } from '@/content/copy/services';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import type { Doc } from '@/lib/content/schema';
import { useSendMessage } from '@/lib/query/use-send-message';
import {
  applyTopic,
  invalidAnnouncement,
  invalidFields,
  toPayload,
  validateForm,
  type FieldErrors,
  type FieldName,
  type FormLimits,
} from './message-form';
import { fill } from '@/lib/chat/fill';

export type FormStatus = 'idle' | 'sending' | 'failed' | 'sent';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Design review: `?form=error` forces the failure state, as in the mockup. Only in development and in the tests: a production build
 * does not contain the check, so a visitor cannot make the form look broken with a link.
 */
const forcedFailure = () =>
  process.env.NODE_ENV !== 'production' &&
  /[?&]form=error/.test(window.location.search);

/**
 * State and behaviour of the contact form: topic chips that write the starting text, validation,
 * the character count, and the idle / sending / failed / sent states.
 */
export function useContactForm(limits: FormLimits) {
  const { mutateAsync } = useSendMessage();
  const copy = useCopy(servicesCopy);
  const { lang } = useLang();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [topicId, setTopicId] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<FormStatus>('idle');
  const [sentTo, setSentTo] = useState({ name: '', email: '' });
  const [announcement, setAnnouncement] = useState('');

  const topicName = useRef('');
  const starter = useRef('');
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const sendRef = useRef<HTMLButtonElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const announceTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const refocusName = useRef(false);

  useEffect(() => () => clearTimeout(announceTimer.current), []);

  /** Clear first so a repeated sentence is announced again. */
  const say = useCallback((text: string) => {
    clearTimeout(announceTimer.current);
    setAnnouncement('');
    announceTimer.current = setTimeout(() => setAnnouncement(text), 30);
  }, []);

  useEffect(() => {
    if (status === 'sent') headingRef.current?.focus();
    if (status === 'failed') sendRef.current?.focus();
    if (status === 'idle' && refocusName.current) {
      refocusName.current = false;
      nameRef.current?.focus();
    }
  }, [status]);

  const clearError = (field: FieldName) =>
    setErrors((e) => (e[field] ? { ...e, [field]: undefined } : e));

  const onField =
    (field: FieldName) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      if (field === 'name') setName(value);
      if (field === 'email') setEmail(value);
      if (field === 'message') setMessage(value);
      clearError(field);
    };

  const selectTopic = (service: Doc<'services'>) => {
    const on = topicId !== service.id;
    const next = on ? service.starter : '';
    const text = applyTopic(message, starter.current, next);
    starter.current = next;
    topicName.current = on ? service.name : '';
    setTopicId(on ? service.id : '');
    setMessage(text);
    clearError('message');
    // wait for the new text to render, then put the caret after it
    requestAnimationFrame(() => {
      const area = messageRef.current;
      if (!area) return;
      area.focus();
      area.setSelectionRange(area.value.length, area.value.length);
    });
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (status === 'sending') return;
    const values = { name, email, message, topic: topicName.current };
    const found = validateForm(
      values,
      limits,
      starter.current,
      copy.form.errors,
    );
    setErrors(found);
    const bad = invalidFields(found);
    if (bad.length) {
      say(invalidAnnouncement(bad, copy));
      const target = { name: nameRef, email: emailRef, message: messageRef }[
        bad[0]
      ];
      target.current?.focus();
      return;
    }
    const payload = toPayload(values, limits, lang);
    setStatus('sending');
    say(copy.live.sending);
    try {
      if (honeypot) {
        // a bot filled the hidden field: look like success, send nothing
        await wait(800);
      } else if (forcedFailure()) {
        await wait(1100);
        throw new Error('forced failure');
      } else {
        await mutateAsync(payload);
      }
      setSentTo({ name: payload.name, email: payload.email });
      setStatus('sent');
      say(fill(copy.live.sent, { email: payload.email }));
    } catch {
      setStatus('failed');
      say(copy.live.failed);
    }
  };

  const reset = () => {
    setName('');
    setEmail('');
    setMessage('');
    setHoneypot('');
    setTopicId('');
    setErrors({});
    topicName.current = '';
    starter.current = '';
    refocusName.current = true;
    setStatus('idle');
  };

  return {
    values: { name, email, message, honeypot },
    topicId,
    errors,
    status,
    sentTo,
    announcement,
    nameRef,
    emailRef,
    messageRef,
    sendRef,
    headingRef,
    onField,
    setHoneypot,
    selectTopic,
    submit,
    reset,
  };
}
