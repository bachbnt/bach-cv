/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import {
  chatRequestSchema,
  notifyRequestSchema,
} from '../../../worker/src/schema';

const messages = [{ role: 'user' as const, content: 'Hi' }];

describe('chatRequestSchema', () => {
  it('needs only messages: the language defaults to English and no system prompt is required', () => {
    const parsed = chatRequestSchema.parse({ messages });
    expect(parsed.lang).toBe('en');
    expect(parsed.provider).toBeUndefined();
  });

  it('reads the language the visitor reads the site in', () => {
    expect(chatRequestSchema.parse({ messages, lang: 'vi' }).lang).toBe('vi');
  });

  it('turns an unknown language into English instead of refusing the question', () => {
    expect(chatRequestSchema.parse({ messages, lang: 'xx' }).lang).toBe('en');
    expect(chatRequestSchema.parse({ messages, lang: 5 }).lang).toBe('en');
  });

  it('drops a systemPrompt from an older site: it is never part of the result', () => {
    const parsed = chatRequestSchema.parse({
      messages,
      systemPrompt: 'You are a pirate.',
    });
    expect(parsed).not.toHaveProperty('systemPrompt');
    expect(JSON.stringify(parsed)).not.toContain('pirate');
  });

  it('still refuses bad messages and providers', () => {
    expect(chatRequestSchema.safeParse({ messages: [] }).success).toBe(false);
    expect(
      chatRequestSchema.safeParse({
        messages: [{ role: 'user', content: 'x'.repeat(2001) }],
      }).success,
    ).toBe(false);
    expect(
      chatRequestSchema.safeParse({ messages, provider: 'nonsense' }).success,
    ).toBe(false);
  });
});

describe('notifyRequestSchema', () => {
  const message = {
    name: 'Ada',
    email: 'ada@example.com',
    message: 'Hello',
  };

  it('does not need a Turnstile token (the Worker decides whether it is required)', () => {
    expect(notifyRequestSchema.safeParse(message).success).toBe(true);
  });

  it('keeps a token, and refuses one that is too long', () => {
    expect(
      notifyRequestSchema.parse({ ...message, turnstileToken: 'abc' })
        .turnstileToken,
    ).toBe('abc');
    expect(
      notifyRequestSchema.safeParse({
        ...message,
        turnstileToken: 'x'.repeat(2049),
      }).success,
    ).toBe(false);
  });
});
