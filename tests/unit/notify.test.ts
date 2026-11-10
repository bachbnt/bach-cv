/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { afterEach, describe, expect, it, vi } from 'vitest';
import { notifyBody, notifyEndpoint, notifyMessage } from '@/lib/notify';

const input = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  topic: 'Web Development',
  message: 'I need a site.',
  locale: 'en' as const,
};

afterEach(() => vi.unstubAllGlobals());

describe('notifyEndpoint', () => {
  it('uses the same Worker address as the chat', () => {
    expect(notifyEndpoint('https://x.workers.dev')).toBe(
      'https://x.workers.dev/notify',
    );
    expect(notifyEndpoint('https://x.workers.dev/')).toBe(
      'https://x.workers.dev/notify',
    );
    expect(notifyEndpoint('https://x.workers.dev/chat')).toBe(
      'https://x.workers.dev/notify',
    );
    expect(notifyEndpoint('https://x.workers.dev/notify')).toBe(
      'https://x.workers.dev/notify',
    );
  });

  it('is off when no Worker is configured', () => {
    expect(notifyEndpoint('')).toBeNull();
    expect(notifyEndpoint('   ')).toBeNull();
  });
});

describe('notifyMessage', () => {
  it('posts the message to the Worker without waiting', () => {
    const fetchMock = vi.fn(async () => new Response('{}'));
    vi.stubGlobal('fetch', fetchMock);
    notifyMessage(input, 'https://x.workers.dev/chat', '');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];
    expect(url).toBe('https://x.workers.dev/notify');
    expect(init.keepalive).toBe(true);
    expect(JSON.parse(init.body as string)).toEqual(input);
  });

  it('does nothing without a Worker, and never throws when the Worker is down', async () => {
    const fetchMock = vi.fn(async () => {
      throw new Error('offline');
    });
    vi.stubGlobal('fetch', fetchMock);
    notifyMessage(input, '', 'site-key');
    expect(fetchMock).not.toHaveBeenCalled();
    expect(() =>
      notifyMessage(input, 'https://x.workers.dev', ''),
    ).not.toThrow();
    await Promise.resolve();
  });
});

describe('notifyBody', () => {
  it('is the message, and adds the Turnstile token only when there is one', () => {
    expect(notifyBody(input)).toEqual(input);
    expect(notifyBody(input, null)).toEqual(input);
    expect(notifyBody(input, '')).not.toHaveProperty('turnstileToken');
    expect(notifyBody(input, 'tok')).toEqual({
      ...input,
      turnstileToken: 'tok',
    });
  });

  it('sends only the fields of the message, not anything else on the object', () => {
    const extra = { ...input, createdAt: 'now' } as typeof input;
    expect(Object.keys(notifyBody(extra))).not.toContain('createdAt');
  });
});
