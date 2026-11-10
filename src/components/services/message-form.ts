/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { messageSchema, type Lang } from '@/lib/content/schema';
import type { ServicesCopy } from '@/content/copy/services';
import { fill } from '@/lib/chat/fill';

export type FieldName = 'name' | 'email' | 'message';
export type FieldErrors = Partial<Record<FieldName, string>>;

export interface FormValues {
  name: string;
  email: string;
  message: string;
  topic: string;
}

export interface FormLimits {
  nameMax: number;
  messageMax: number;
}

/** The counter turns to a warning at 90% of the limit. */
export const warnAt = (max: number) => Math.floor(max * 0.9);

export const counterText = (
  used: number,
  max: number,
  copy: ServicesCopy['form']['count'],
) => fill(used >= max ? copy.limit : copy.value, { used, max });

/**
 * The starting text follows the chosen topic and keeps what the visitor typed:
 * an empty message takes the new starter; a message that still begins with the previous starter swaps only that opener;
 * anything else is the visitor's own text and is left alone.
 */
export function applyTopic(
  message: string,
  previousStarter: string,
  nextStarter: string,
): string {
  if (!message.trim()) return nextStarter;
  if (previousStarter && message.startsWith(previousStarter))
    return nextStarter + message.slice(previousStarter.length);
  return message;
}

/**
 * Checks the form with the same schema the write uses (`messageSchema`), then the site limits, and the case where
 * the visitor only left the starter sentence. Returns friendly text per field; empty means valid.
 */
export function validateForm(
  values: FormValues,
  limits: FormLimits,
  starter: string,
  copy: ServicesCopy['form']['errors'],
): FieldErrors {
  const errors: FieldErrors = {};
  const e = copy;
  const parsed = messageSchema.safeParse({ ...values, locale: 'en' });
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (field === 'name' && !errors.name)
        errors.name = values.name.trim() ? e.nameLong : e.name;
      if (field === 'email' && !errors.email) errors.email = e.email;
      if (field === 'message' && !errors.message)
        errors.message = values.message.trim() ? e.messageLong : e.message;
    }
  }
  if (!errors.name && values.name.trim().length > limits.nameMax)
    errors.name = e.nameLong;
  if (!errors.message && values.message.trim().length > limits.messageMax)
    errors.message = e.messageLong;
  if (!errors.message && starter && values.message.trim() === starter.trim())
    errors.message = e.starterOnly;
  return errors;
}

/** Labels of the fields with an error, in form order, for the live announcement. */
export function invalidFields(errors: FieldErrors): FieldName[] {
  return (['name', 'email', 'message'] as const).filter((f) => errors[f]);
}

export const fieldLabel = (field: FieldName, copy: ServicesCopy['form']) =>
  copy[field];

/** "3 fields need attention: Name, Email, Message" in the visitor's language. */
export const invalidAnnouncement = (fields: FieldName[], copy: ServicesCopy) =>
  fill(fields.length === 1 ? copy.live.invalidOne : copy.live.invalidMany, {
    count: fields.length,
    fields: fields.map((f) => fieldLabel(f, copy.form)).join(', '),
  });

/** The write payload: trimmed and clamped to the limits. `locale` is the visitor's language. */
export function toPayload(
  values: FormValues,
  limits: FormLimits,
  locale: Lang,
) {
  return {
    name: values.name.trim().slice(0, limits.nameMax),
    email: values.email.trim(),
    topic: values.topic,
    message: values.message.trim().slice(0, limits.messageMax),
    locale,
  };
}
