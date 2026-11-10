/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { afterEach, describe, expect, it, vi } from 'vitest';

const getTurnstileToken = vi.fn<(siteKey: string) => Promise<string | null>>();
vi.mock('@/lib/turnstile', () => ({
  TURNSTILE_SITE_KEY: '',
  getTurnstileToken: (siteKey: string) => getTurnstileToken(siteKey),
}));

const { notifyMessage } = await import('@/lib/notify');

const input = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  message: 'I need a site.',
  locale: 'en' as const,
};

const sentBody = (fetchMock: ReturnType<typeof vi.fn>) =>
  JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string);

afterEach(() => {
  vi.unstubAllGlobals();
  getTurnstileToken.mockReset();
});

describe('notifyMessage with a Turnstile site key', () => {
  it('sends the token it got along with the message', async () => {
    getTurnstileToken.mockResolvedValue('tok-1');
    const fetchMock = vi.fn(async () => new Response('{}'));
    vi.stubGlobal('fetch', fetchMock);
    notifyMessage(input, 'https://x.workers.dev', 'site-key');
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(getTurnstileToken).toHaveBeenCalledWith('site-key');
    expect(sentBody(fetchMock)).toEqual({ ...input, turnstileToken: 'tok-1' });
  });

  it('still sends the message when there is no token (the Worker decides)', async () => {
    getTurnstileToken.mockResolvedValue(null);
    const fetchMock = vi.fn(async () => new Response('{}'));
    vi.stubGlobal('fetch', fetchMock);
    notifyMessage(input, 'https://x.workers.dev', 'site-key');
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(sentBody(fetchMock)).not.toHaveProperty('turnstileToken');
  });

  it('does not ask for a token without a site key, and sends at once', () => {
    const fetchMock = vi.fn(async () => new Response('{}'));
    vi.stubGlobal('fetch', fetchMock);
    notifyMessage(input, 'https://x.workers.dev', '');
    expect(getTurnstileToken).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
