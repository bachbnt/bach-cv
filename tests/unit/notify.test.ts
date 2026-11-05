/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { afterEach, describe, expect, it, vi } from 'vitest';
import { notifyEndpoint, notifyMessage } from '@/lib/notify';

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
    notifyMessage(input, 'https://x.workers.dev/chat');
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
    notifyMessage(input, '');
    expect(fetchMock).not.toHaveBeenCalled();
    expect(() => notifyMessage(input, 'https://x.workers.dev')).not.toThrow();
    await Promise.resolve();
  });
});
