/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { afterEach, describe, expect, it, vi } from 'vitest';
import worker, { enabledProviders, type Env } from '../../../worker/src/index';
import type { KvLike } from '../../../worker/src/rateLimit';

const ORIGIN = 'https://bachbntdev.web.app';

const baseEnv = (extra: Partial<Env> = {}): Env => ({
  ALLOWED_ORIGINS: ORIGIN,
  GEMINI_API_KEY: 'gem-key',
  OPENAI_API_KEY: 'openai-key',
  ANTHROPIC_API_KEY: 'claude-key',
  ...extra,
});

const chat = (provider: string | undefined, init: RequestInit = {}) =>
  new Request('https://worker.test/chat', {
    method: 'POST',
    headers: { Origin: ORIGIN, 'CF-Connecting-IP': '1.2.3.4' },
    body: JSON.stringify({
      ...(provider ? { provider } : {}),
      messages: [{ role: 'user', content: 'Hi' }],
      systemPrompt: 'Be brief.',
    }),
    ...init,
  });

/** A KV namespace in memory. */
const memoryKv = (): KvLike & { data: Map<string, string> } => {
  const data = new Map<string, string>();
  return {
    data,
    get: async (key) => data.get(key) ?? null,
    put: async (key, value) => void data.set(key, value),
  };
};

afterEach(() => vi.unstubAllGlobals());

const stubUpstream = (body: unknown) => {
  const fetchMock = vi.fn(async () => Response.json(body));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

describe('providers', () => {
  it('serves Workers AI and Gemini unless others are enabled, in the order given', () => {
    expect(enabledProviders(baseEnv())).toEqual(['cloudflare', 'gemini']);
    expect(
      enabledProviders(baseEnv({ ALLOWED_PROVIDERS: 'gemini, claude' })),
    ).toEqual(['gemini', 'claude']);
    expect(
      enabledProviders(baseEnv({ ALLOWED_PROVIDERS: 'gemini,gemini' })),
    ).toEqual(['gemini']);
    expect(
      enabledProviders(baseEnv({ ALLOWED_PROVIDERS: 'nonsense' })),
    ).toEqual([]);
  });

  it('refuses a provider that is not enabled, without calling it', async () => {
    const upstream = stubUpstream({});
    const res = await worker.fetch(chat('claude'), baseEnv());
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: 'provider_not_enabled' });
    expect(upstream).not.toHaveBeenCalled();
  });

  it('serves Claude once it is enabled, with a cap on the answer', async () => {
    const upstream = stubUpstream({ content: [{ text: 'Hello' }] });
    const res = await worker.fetch(
      chat('claude'),
      baseEnv({ ALLOWED_PROVIDERS: 'claude' }),
    );
    expect(await res.json()).toEqual({ text: 'Hello', provider: 'claude' });
    const body = JSON.parse(
      (upstream.mock.calls[0] as unknown as [string, RequestInit])[1]
        .body as string,
    );
    expect(body.max_tokens).toBe(1024);
  });

  it('sends the Gemini key in a header, not in the URL, and caps the answer', async () => {
    const upstream = stubUpstream({
      candidates: [{ content: { parts: [{ text: 'Hi there' }] } }],
    });
    const res = await worker.fetch(chat('gemini'), baseEnv());
    expect(await res.json()).toEqual({ text: 'Hi there', provider: 'gemini' });
    const [url, init] = upstream.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];
    expect(url).not.toContain('key=');
    expect(url).not.toContain('gem-key');
    expect((init.headers as Record<string, string>)['x-goog-api-key']).toBe(
      'gem-key',
    );
    expect(JSON.parse(init.body as string).generationConfig).toEqual({
      maxOutputTokens: 1024,
    });
  });

  it('uses the model from the configuration', async () => {
    const upstream = stubUpstream({
      candidates: [{ content: { parts: [{ text: 'ok' }] } }],
    });
    await worker.fetch(chat('gemini'), baseEnv({ GEMINI_MODEL: 'gemini-x' }));
    expect((upstream.mock.calls[0] as unknown as [string])[0]).toContain(
      '/models/gemini-x:generateContent',
    );
  });
});

describe('rate limit', () => {
  it('answers 429 once the minute limit is reached', async () => {
    stubUpstream({ candidates: [{ content: { parts: [{ text: 'ok' }] } }] });
    const env = baseEnv({
      CHAT_RATE_LIMIT: memoryKv(),
      RATE_LIMIT_PER_MINUTE: '2',
    });
    expect((await worker.fetch(chat('gemini'), env)).status).toBe(200);
    expect((await worker.fetch(chat('gemini'), env)).status).toBe(200);
    const third = await worker.fetch(chat('gemini'), env);
    expect(third.status).toBe(429);
    expect(await third.json()).toEqual({ error: 'rate_limit_minute' });
  });

  it('lets requests through without KV, unless it is required', async () => {
    stubUpstream({ candidates: [{ content: { parts: [{ text: 'ok' }] } }] });
    expect((await worker.fetch(chat('gemini'), baseEnv())).status).toBe(200);
    const res = await worker.fetch(
      chat('gemini'),
      baseEnv({ REQUIRE_RATE_LIMIT: 'true' }),
    );
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: 'rate_limit_unavailable' });
  });
});

describe('health and requests', () => {
  it('says whether the rate limit is on and which providers are served', async () => {
    const health = (env: Env) =>
      worker
        .fetch(new Request('https://worker.test/health'), env)
        .then((r) => r.json());
    expect(await health(baseEnv())).toEqual({
      ok: true,
      rateLimit: false,
      providers: ['cloudflare', 'gemini'],
      notify: false,
    });
    expect(await health(baseEnv({ CHAT_RATE_LIMIT: memoryKv() }))).toEqual({
      ok: true,
      rateLimit: true,
      providers: ['cloudflare', 'gemini'],
      notify: false,
    });
    expect(
      await health(
        baseEnv({
          CHAT_RATE_LIMIT: memoryKv(),
          RESEND_API_KEY: 're_x',
          NOTIFY_TO: 'me@example.com',
        }),
      ),
    ).toMatchObject({ notify: true });
  });

  it('only echoes an allowed origin', async () => {
    const allowed = await worker.fetch(chat('gemini'), baseEnv());
    expect(allowed.headers.get('Access-Control-Allow-Origin')).toBe(ORIGIN);
    const other = await worker.fetch(
      chat('gemini', { headers: { Origin: 'https://evil.example' } }),
      baseEnv(),
    );
    expect(other.headers.get('Access-Control-Allow-Origin')).toBe('null');
  });

  it('rejects a body that is not valid', async () => {
    const res = await worker.fetch(
      new Request('https://worker.test/chat', {
        method: 'POST',
        body: JSON.stringify({ provider: 'gemini', messages: [] }),
      }),
      baseEnv(),
    );
    expect(res.status).toBe(400);
  });
});

/** A Workers AI binding that answers, or throws. */
const fakeAi = (answer: unknown | Error) => {
  const run = vi.fn(async () => {
    if (answer instanceof Error) throw answer;
    return answer;
  });
  return { run };
};

describe('Workers AI and the fallback', () => {
  it('asks Workers AI first, with the system prompt and a cap, and never calls Gemini', async () => {
    const upstream = stubUpstream({});
    const ai = fakeAi({ response: 'From the edge' });
    const res = await worker.fetch(chat(undefined), baseEnv({ AI: ai }));
    expect(await res.json()).toEqual({
      text: 'From the edge',
      provider: 'cloudflare',
    });
    expect(upstream).not.toHaveBeenCalled();
    const [model, input] = ai.run.mock.calls[0] as unknown as [
      string,
      { messages: { role: string; content: string }[]; max_tokens: number },
    ];
    expect(model).toBe('@cf/meta/llama-3.1-8b-instruct-fp8');
    expect(input.max_tokens).toBe(1024);
    expect(input.messages[0]).toEqual({ role: 'system', content: 'Be brief.' });
    expect(input.messages[1]).toEqual({ role: 'user', content: 'Hi' });
  });

  it('moves on to Gemini when the free allowance is spent', async () => {
    stubUpstream({
      candidates: [{ content: { parts: [{ text: 'Gemini here' }] } }],
    });
    const ai = fakeAi(
      new Error(
        '4006: you have used up your daily free allocation of 10,000 neurons',
      ),
    );
    const res = await worker.fetch(chat(undefined), baseEnv({ AI: ai }));
    expect(await res.json()).toEqual({
      text: 'Gemini here',
      provider: 'gemini',
    });
  });

  it('skips a provider that is not set up, instead of failing', async () => {
    stubUpstream({ candidates: [{ content: { parts: [{ text: 'ok' }] } }] });
    // no AI binding at all
    const res = await worker.fetch(chat(undefined), baseEnv());
    expect(await res.json()).toMatchObject({ provider: 'gemini' });
  });

  it('reports the failure when every provider fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('{}', { status: 429 })),
    );
    const ai = fakeAi(new Error('rate limit exceeded'));
    const res = await worker.fetch(chat(undefined), baseEnv({ AI: ai }));
    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({ error: 'rate_limit' });
  });

  it('answers 403 when nothing is enabled', async () => {
    const res = await worker.fetch(
      chat(undefined),
      baseEnv({ ALLOWED_PROVIDERS: 'nonsense' }),
    );
    expect(res.status).toBe(403);
  });

  it('uses the model from the configuration', async () => {
    const ai = fakeAi({ response: 'x' });
    await worker.fetch(
      chat('cloudflare'),
      baseEnv({ AI: ai, CLOUDFLARE_AI_MODEL: '@cf/meta/other' }),
    );
    expect((ai.run.mock.calls[0] as unknown as [string])[0]).toBe(
      '@cf/meta/other',
    );
  });
});

describe('email notification', () => {
  const message = {
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    topic: 'App Development',
    message: 'I need an app.',
    locale: 'en',
  };
  const notify = (body: unknown, ip = '1.2.3.4') =>
    new Request('https://worker.test/notify', {
      method: 'POST',
      headers: { Origin: ORIGIN, 'CF-Connecting-IP': ip },
      body: JSON.stringify(body),
    });
  const configured = (extra: Partial<Env> = {}) =>
    baseEnv({
      RESEND_API_KEY: 're_secret',
      NOTIFY_TO: 'me@example.com',
      CHAT_RATE_LIMIT: memoryKv(),
      ...extra,
    });

  it('does nothing until it is configured', async () => {
    const upstream = stubUpstream({});
    const res = await worker.fetch(notify(message), baseEnv());
    expect(await res.json()).toEqual({
      ok: true,
      sent: false,
      reason: 'not_configured',
    });
    expect(upstream).not.toHaveBeenCalled();
  });

  it('sends nothing without the rate limit, so the inbox cannot be flooded', async () => {
    const upstream = stubUpstream({});
    const res = await worker.fetch(
      notify(message),
      baseEnv({ RESEND_API_KEY: 're_secret', NOTIFY_TO: 'me@example.com' }),
    );
    expect(await res.json()).toEqual({
      ok: true,
      sent: false,
      reason: 'rate_limit_unavailable',
    });
    expect(upstream).not.toHaveBeenCalled();
  });

  it('emails the message to the owner, with the visitor as the reply address', async () => {
    const upstream = stubUpstream({ id: 'mail_1' });
    const res = await worker.fetch(notify(message), configured());
    expect(await res.json()).toEqual({ ok: true, sent: true });
    const [url, init] = upstream.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];
    expect(url).toBe('https://api.resend.com/emails');
    expect((init.headers as Record<string, string>).Authorization).toBe(
      'Bearer re_secret',
    );
    const body = JSON.parse(init.body as string);
    expect(body.to).toEqual(['me@example.com']);
    expect(body.reply_to).toBe('ada@example.com');
    expect(body.from).toBe('BB Bot <onboarding@resend.dev>');
    expect(body.subject).toBe('New message from Ada Lovelace');
    expect(body.text).toContain('I need an app.');
    expect(body.text).toContain('Topic: App Development');
  });

  it('keeps a line break out of the subject', async () => {
    const upstream = stubUpstream({});
    await worker.fetch(
      notify({ ...message, name: 'Ada\r\nBcc: spam@example.com' }),
      configured(),
    );
    const body = JSON.parse(
      (upstream.mock.calls[0] as unknown as [string, RequestInit])[1]
        .body as string,
    );
    expect(body.subject).not.toMatch(/[\r\n]/);
  });

  it('rejects a message that is not valid, as the Firestore rules would', async () => {
    const upstream = stubUpstream({});
    for (const bad of [
      { ...message, email: 'not-an-email' },
      { ...message, name: '' },
      { ...message, message: 'x'.repeat(1001) },
      { ...message, topic: 'x'.repeat(41) },
    ]) {
      expect((await worker.fetch(notify(bad), configured())).status).toBe(400);
    }
    expect(upstream).not.toHaveBeenCalled();
  });

  it('limits one visitor per hour and the whole site per day', async () => {
    stubUpstream({});
    const env = configured({ NOTIFY_PER_HOUR: '2', NOTIFY_PER_DAY: '3' });
    expect((await worker.fetch(notify(message, '9.9.9.9'), env)).status).toBe(
      200,
    );
    expect((await worker.fetch(notify(message, '9.9.9.9'), env)).status).toBe(
      200,
    );
    const third = await worker.fetch(notify(message, '9.9.9.9'), env);
    expect(third.status).toBe(429);
    expect(await third.json()).toEqual({ error: 'rate_limit_hour' });
    // another visitor still gets through, up to the daily total of 3
    expect((await worker.fetch(notify(message, '8.8.8.8'), env)).status).toBe(
      200,
    );
    const over = await worker.fetch(notify(message, '7.7.7.7'), env);
    expect(over.status).toBe(429);
    expect(await over.json()).toEqual({ error: 'rate_limit_day' });
  });

  it('says so when the email service fails, without throwing', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('no', { status: 500 })),
    );
    const res = await worker.fetch(notify(message), configured());
    expect(res.status).toBe(502);
  });
});
