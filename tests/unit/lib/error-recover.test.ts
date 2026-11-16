/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import { errorsCopy } from '@/content/copy/errors';
import {
  clearQueryCache,
  QUERY_CACHE_KEY,
  savedLang,
} from '@/lib/error/recover';

// The screens for an error run when something of the app has failed, so what they read from the browser must never throw.

const store = (items: Record<string, string>) => ({
  getItem: (k: string) => items[k] ?? null,
  removeItem: (k: string) => {
    delete items[k];
  },
});
const broken = {
  getItem: () => {
    throw new Error('SecurityError');
  },
  removeItem: () => {
    throw new Error('SecurityError');
  },
};

describe('clearQueryCache', () => {
  it('forgets the content kept by the browser and leaves the rest', () => {
    const items = { [QUERY_CACHE_KEY]: '{"old":1}', 'bach-cv-lang': 'vi' };
    expect(clearQueryCache(store(items))).toBe(true);
    expect(items).toEqual({ 'bach-cv-lang': 'vi' });
  });

  it('says false, and does not throw, when the storage is not allowed', () => {
    expect(clearQueryCache(broken)).toBe(false);
  });
});

describe('savedLang', () => {
  it('is the saved language', () => {
    expect(savedLang(store({ 'bach-cv-lang': 'vi' }))).toBe('vi');
    expect(savedLang(store({ 'bach-cv-lang': 'en' }))).toBe('en');
  });

  it('is English when nothing is saved, the value is not a language, or the storage throws', () => {
    expect(savedLang(store({}))).toBe('en');
    expect(savedLang(store({ 'bach-cv-lang': 'fr' }))).toBe('en');
    expect(savedLang(broken)).toBe('en');
  });
});

describe('errorsCopy', () => {
  it('has the same two ways out for every screen, in both languages', () => {
    for (const lang of ['en', 'vi'] as const)
      for (const [name, words] of Object.entries(errorsCopy[lang])) {
        expect(words.title, `${lang} ${name} title`).not.toBe('');
        expect(words.body, `${lang} ${name} body`).not.toBe('');
        expect(words.retry, `${lang} ${name} retry`).not.toBe('');
        expect(words.home, `${lang} ${name} home`).not.toBe('');
      }
  });
});
