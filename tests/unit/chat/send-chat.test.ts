/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { afterEach, describe, expect, it, vi } from 'vitest';
import { ChatError, sendChat } from '@/lib/chat/chat-api';

const body = {
  messages: [{ role: 'user' as const, content: 'Hi' }],
  systemPrompt: 'Be brief.',
};
const options = { proxyUrl: 'https://x.workers.dev' };

const answer = (status: number, data: unknown) =>
  new Response(JSON.stringify(data), { status });
const sentBodies = (fetchMock: ReturnType<typeof vi.fn>) =>
  fetchMock.mock.calls.map(
    (call) =>
      JSON.parse((call[1] as RequestInit).body as string) as Record<
        string,
        unknown
      >,
  );

afterEach(() => vi.unstubAllGlobals());

describe('sendChat', () => {
  it('leaves the choice of provider to the Worker', async () => {
    const fetchMock = vi.fn(async () => answer(200, { text: 'Hello' }));
    vi.stubGlobal('fetch', fetchMock);
    expect(await sendChat(body, options)).toBe('Hello');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(sentBodies(fetchMock)[0]).not.toHaveProperty('provider');
  });

  it('asks Gemini by name once when an older Worker insists on a provider', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(answer(400, { error: 'invalid_request' }))
      .mockResolvedValueOnce(answer(200, { text: 'From Gemini' }));
    vi.stubGlobal('fetch', fetchMock);
    expect(await sendChat(body, options)).toBe('From Gemini');
    expect(sentBodies(fetchMock)).toHaveLength(2);
    expect(sentBodies(fetchMock)[1].provider).toBe('gemini');
  });

  it('does not retry other errors', async () => {
    const fetchMock = vi.fn(async () =>
      answer(429, { error: 'rate_limit_day' }),
    );
    vi.stubGlobal('fetch', fetchMock);
    await expect(sendChat(body, options)).rejects.toMatchObject({
      kind: 'daily-limit',
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('gives up after the one retry', async () => {
    const fetchMock = vi.fn(async () =>
      answer(400, { error: 'invalid_request' }),
    );
    vi.stubGlobal('fetch', fetchMock);
    await expect(sendChat(body, options)).rejects.toBeInstanceOf(ChatError);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('is unavailable without a Worker', async () => {
    await expect(sendChat(body, { proxyUrl: '' })).rejects.toMatchObject({
      kind: 'unavailable',
    });
  });
});
