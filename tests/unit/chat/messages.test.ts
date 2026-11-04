/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import { chatEndpoint, errorKindOf, WORKER_LIMITS } from '@/lib/chat/chat-api';
import {
  countUserMessages,
  toWireMessages,
  type ChatEntry,
} from '@/lib/chat/messages';
import { fill } from '@/lib/chat/fill';
import { resolveSuggestions } from '@/lib/chat/suggestions';
import { chatCopy } from '@/content/copy/chat';

const defaults = chatCopy.vi.defaultSuggestions;

const entry = (
  role: ChatEntry['role'],
  content: string,
  id = content,
): ChatEntry => ({
  id,
  role,
  content,
});

describe('toWireMessages', () => {
  it('maps bot to model and drops error notes', () => {
    expect(
      toWireMessages([
        entry('user', 'hi'),
        entry('bot', 'hello'),
        entry('user', 'more'),
        entry('error', 'Something went wrong'),
      ]),
    ).toEqual([
      { role: 'user', content: 'hi' },
      { role: 'model', content: 'hello' },
      { role: 'user', content: 'more' },
    ]);
  });

  it('merges two turns in a row from the same side', () => {
    expect(
      toWireMessages([
        entry('user', 'first'),
        entry('error', 'x'),
        entry('user', 'second'),
      ]),
    ).toEqual([{ role: 'user', content: 'first\n\nsecond' }]);
  });

  it('starts with a user turn', () => {
    expect(
      toWireMessages([entry('bot', 'welcome'), entry('user', 'hi')]),
    ).toEqual([{ role: 'user', content: 'hi' }]);
    expect(toWireMessages([entry('bot', 'welcome')])).toEqual([]);
  });

  it('keeps every turn within the Worker limits', () => {
    const long = 'a'.repeat(WORKER_LIMITS.contentLength + 500);
    const [first] = toWireMessages([entry('user', long)]);
    expect(first.content).toHaveLength(WORKER_LIMITS.contentLength);

    const many = Array.from({ length: 60 }, (_, i) =>
      entry(i % 2 === 0 ? 'user' : 'bot', `m${i}`),
    );
    const wire = toWireMessages(many);
    expect(wire.length).toBeLessThanOrEqual(WORKER_LIMITS.messages);
    expect(wire[0].role).toBe('user');
  });
});

describe('countUserMessages', () => {
  it('counts only the visitor questions', () => {
    expect(
      countUserMessages([
        entry('user', 'a'),
        entry('bot', 'b'),
        entry('error', 'c'),
      ]),
    ).toBe(1);
  });
});

describe('chatEndpoint', () => {
  it('accepts the Worker root or the /chat URL', () => {
    expect(chatEndpoint('https://x.workers.dev')).toBe(
      'https://x.workers.dev/chat',
    );
    expect(chatEndpoint('https://x.workers.dev/')).toBe(
      'https://x.workers.dev/chat',
    );
    expect(chatEndpoint('https://x.workers.dev/chat')).toBe(
      'https://x.workers.dev/chat',
    );
  });
  it('is null when not configured', () => {
    expect(chatEndpoint('')).toBeNull();
    expect(chatEndpoint('  ')).toBeNull();
  });
});

describe('errorKindOf', () => {
  it('tells the visitor about limits and hides the rest', () => {
    expect(errorKindOf(429, 'rate_limit_minute')).toBe('rate-limit');
    expect(errorKindOf(429, 'rate_limit')).toBe('rate-limit');
    expect(errorKindOf(429, 'rate_limit_day')).toBe('daily-limit');
    expect(errorKindOf(500, 'Missing Gemini API key')).toBe('server');
    expect(errorKindOf(400, 'invalid_request')).toBe('server');
  });
});

describe('resolveSuggestions', () => {
  it('uses the built-in questions when settings have none', () => {
    expect(resolveSuggestions([], defaults).length).toBeGreaterThan(0);
  });
  it('prefers the configured questions', () => {
    expect(resolveSuggestions([{ id: 'a', text: 'Hello?' }], defaults)).toEqual(
      [{ id: 'a', text: 'Hello?' }],
    );
  });
});

describe('chat copy', () => {
  it('fills placeholders in both languages', () => {
    expect(fill(chatCopy.en.count, { used: 1, max: 20 })).toBe('1/20 messages');
    expect(fill(chatCopy.vi.count, { used: 1, max: 20 })).toBe('1/20 tin nhắn');
    expect(fill(chatCopy.vi.greeting, { name: 'BB Bot' })).toContain('BB Bot');
    expect(fill('{missing}', {})).toBe('{missing}');
  });
  it('has the same suggestion ids in both languages', () => {
    expect(chatCopy.vi.defaultSuggestions.map((s) => s.id)).toEqual(
      chatCopy.en.defaultSuggestions.map((s) => s.id),
    );
  });
});
