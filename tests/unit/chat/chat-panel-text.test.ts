/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import { chatCopy } from '@/content/copy/chat';
import { errorText } from '@/lib/chat/error-text';
import { remainingSuggestions } from '@/lib/chat/suggestions';

describe('errorText', () => {
  const copy = chatCopy.en;

  it('words each kind of error from the copy of the language', () => {
    expect(errorText(copy, 'network')).toBe(copy.errors.network);
    expect(errorText(copy, 'rate-limit')).toBe(copy.errors.rateLimit);
    expect(errorText(copy, 'daily-limit')).toBe(copy.errors.dailyLimit);
    expect(errorText(copy, 'unavailable')).toBe(copy.unavailable);
  });

  it('uses the generic note for any other kind, and the other language for vi', () => {
    expect(errorText(copy, 'whatever')).toBe(copy.errors.generic);
    expect(errorText(chatCopy.vi, 'network')).toBe(chatCopy.vi.errors.network);
    expect(chatCopy.vi.errors.network).not.toBe(copy.errors.network);
  });
});

describe('remainingSuggestions', () => {
  const suggestions = [
    { id: 'a', text: 'What do you do?' },
    { id: 'b', text: 'Where do you work?' },
  ];

  it('offers every question while nothing is asked', () => {
    expect(remainingSuggestions([], suggestions)).toEqual(suggestions);
  });

  it('drops the questions the visitor already sent, word for word, and keeps the rest', () => {
    const entries = [
      { role: 'user' as const, content: 'What do you do?' },
      { role: 'bot' as const, content: 'Where do you work?' },
    ];
    expect(remainingSuggestions(entries, suggestions).map((s) => s.id)).toEqual(
      ['b'],
    );
  });
});
