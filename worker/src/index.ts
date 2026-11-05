/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import {
  callClaude,
  callCloudflareAI,
  callGemini,
  callOpenAI,
  HttpError,
  type AiBinding,
} from './providers';
import {
  enforceNotifyLimit,
  enforceRateLimit,
  type RateLimitEnv,
} from './rateLimit';
import {
  chatProviderSchema,
  chatRequestSchema,
  notifyRequestSchema,
  type ChatMessage,
  type ChatProvider,
  type NotifyRequest,
} from './schema';

export interface Env extends RateLimitEnv {
  /** Workers AI, bound in wrangler.toml (`[ai]`). No key: it runs on the account's free daily allowance. */
  AI?: AiBinding;
  GEMINI_API_KEY?: string;
  OPENAI_API_KEY?: string;
  ANTHROPIC_API_KEY?: string;
  ALLOWED_ORIGINS?: string;
  /**
   * Comma-separated, in the order they are tried: the first one that answers wins, the next one is the fallback.
   * Default `cloudflare,gemini`. A provider without its key or binding is skipped.
   */
  ALLOWED_PROVIDERS?: string;
  CLOUDFLARE_AI_MODEL?: string;
  GEMINI_MODEL?: string;
  OPENAI_MODEL?: string;
  ANTHROPIC_MODEL?: string;
  /** email notification for contact-form messages (Resend). Without both of these nothing is sent. */
  RESEND_API_KEY?: string;
  /** who to tell: one address or several separated by commas. Each gets its own email. */
  NOTIFY_TO?: string;
  /** default `BB Bot <onboarding@resend.dev>`, which Resend lets send to the account's own address */
  NOTIFY_FROM?: string;
  NOTIFY_PER_HOUR?: string;
  NOTIFY_PER_DAY?: string;
}

/** Anyone who can reach the worker can pick the provider, so only the configured ones are served, in this order. */
export const enabledProviders = (env: Env): ChatProvider[] => {
  const wanted = (env.ALLOWED_PROVIDERS ?? 'cloudflare,gemini')
    .split(',')
    .map((s) => s.trim());
  const known: readonly string[] = chatProviderSchema.options;
  return [...new Set(wanted)].filter((p): p is ChatProvider =>
    known.includes(p),
  );
};

const json = (body: unknown, init: ResponseInit = {}): Response =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });

const resolveCors = (request: Request, env: Env): Record<string, string> => {
  const origin = request.headers.get('Origin') ?? '';
  const allowed = (env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const allowAll = allowed.includes('*');
  const isAllowed = allowAll || allowed.includes(origin);
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin || '*' : 'null',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
};

const ask = (
  provider: ChatProvider,
  env: Env,
  messages: ChatMessage[],
  systemPrompt: string,
): Promise<string> => {
  switch (provider) {
    case 'cloudflare':
      return callCloudflareAI(
        env.AI,
        messages,
        systemPrompt,
        env.CLOUDFLARE_AI_MODEL,
      );
    case 'openai':
      return callOpenAI(
        env.OPENAI_API_KEY,
        messages,
        systemPrompt,
        env.OPENAI_MODEL,
      );
    case 'claude':
      return callClaude(
        env.ANTHROPIC_API_KEY,
        messages,
        systemPrompt,
        env.ANTHROPIC_MODEL,
      );
    case 'gemini':
      return callGemini(
        env.GEMINI_API_KEY,
        messages,
        systemPrompt,
        env.GEMINI_MODEL,
      );
  }
};

const handleChat = async (
  request: Request,
  env: Env,
  cors: Record<string, string>,
): Promise<Response> => {
  const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';

  try {
    await enforceRateLimit(env, ip);
  } catch (error) {
    const message = (error as Error).message;
    return json(
      { error: message },
      {
        status: message === 'rate_limit_unavailable' ? 503 : 429,
        headers: cors,
      },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'invalid_json' }, { status: 400, headers: cors });
  }

  const parsed = chatRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return json(
      { error: 'invalid_request', issues: parsed.error.issues },
      { status: 400, headers: cors },
    );
  }

  const { provider, messages, systemPrompt } = parsed.data;
  const enabled = enabledProviders(env);
  if (provider && !enabled.includes(provider)) {
    return json(
      { error: 'provider_not_enabled' },
      { status: 403, headers: cors },
    );
  }

  // one asked-for provider, or every enabled one in order: a spent allowance or a failure moves on to the next
  const order = provider ? [provider] : enabled;
  if (order.length === 0) {
    return json(
      { error: 'provider_not_enabled' },
      { status: 403, headers: cors },
    );
  }
  let failure: HttpError | undefined;
  for (const candidate of order) {
    try {
      const text = await ask(candidate, env, messages, systemPrompt);
      return json({ text, provider: candidate }, { headers: cors });
    } catch (error) {
      failure =
        error instanceof HttpError
          ? error
          : new HttpError(502, 'upstream_error');
    }
  }
  return json(
    { error: failure?.message ?? 'upstream_error' },
    { status: failure?.status ?? 502, headers: cors },
  );
};

/** The addresses in `NOTIFY_TO`: comma or semicolon separated, at most five, each looking like an email address. */
export const recipientsOf = (list: string | undefined): string[] =>
  [
    ...new Set(
      (list ?? '')
        .split(/[,;]/)
        .map((s) => s.trim())
        .filter((s) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s)),
    ),
  ].slice(0, 5);

/** A line of a header must not carry a line break (it would let a visitor add headers). */
const oneLine = (text: string): string => text.replace(/[\r\n]+/g, ' ').trim();

const emailText = (input: NotifyRequest): string =>
  [
    `Name: ${oneLine(input.name)}`,
    `Email: ${input.email}`,
    ...(input.topic ? [`Topic: ${oneLine(input.topic)}`] : []),
    ...(input.locale ? [`Language: ${input.locale}`] : []),
    '',
    input.message,
  ].join('\n');

/**
 * Tells the site owner about a contact-form message by email. The message itself is already in Firestore (the
 * browser saved it first), so this is only a nudge: it never needs to succeed for the visitor.
 */
const handleNotify = async (
  request: Request,
  env: Env,
  cors: Record<string, string>,
): Promise<Response> => {
  if (!env.RESEND_API_KEY || recipientsOf(env.NOTIFY_TO).length === 0) {
    return json(
      { ok: true, sent: false, reason: 'not_configured' },
      { headers: cors },
    );
  }
  // Without the rate limit anyone could fill the inbox and use up the free email quota, so send nothing.
  if (!env.CHAT_RATE_LIMIT) {
    return json(
      { ok: true, sent: false, reason: 'rate_limit_unavailable' },
      { headers: cors },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'invalid_json' }, { status: 400, headers: cors });
  }
  const parsed = notifyRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return json({ error: 'invalid_request' }, { status: 400, headers: cors });
  }

  try {
    await enforceNotifyLimit(
      env,
      request.headers.get('CF-Connecting-IP') ?? 'unknown',
    );
  } catch (error) {
    return json(
      { error: (error as Error).message },
      { status: 429, headers: cors },
    );
  }

  const input = parsed.data;
  // One email per address: while the sender has no verified domain Resend only delivers to the account's own
  // address, and a request that names another one is refused as a whole.
  const results = await Promise.all(
    recipientsOf(env.NOTIFY_TO).map((to) =>
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: env.NOTIFY_FROM ?? 'BB Bot <onboarding@resend.dev>',
          to: [to],
          reply_to: input.email,
          subject: `New message from ${oneLine(input.name).slice(0, 80)}`,
          text: emailText(input),
        }),
      })
        .then((response) => response.ok)
        .catch(() => false),
    ),
  );

  const delivered = results.filter(Boolean).length;
  if (delivered === 0) {
    return json({ error: 'email_failed' }, { status: 502, headers: cors });
  }
  return json(
    { ok: true, sent: true, delivered, of: results.length },
    { headers: cors },
  );
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const cors = resolveCors(request, env);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    const url = new URL(request.url);
    if (request.method === 'GET' && url.pathname === '/health') {
      return json(
        {
          ok: true,
          rateLimit: Boolean(env.CHAT_RATE_LIMIT),
          providers: enabledProviders(env),
          notify: Boolean(
            env.RESEND_API_KEY &&
            recipientsOf(env.NOTIFY_TO).length > 0 &&
            env.CHAT_RATE_LIMIT,
          ),
        },
        { headers: cors },
      );
    }

    if (request.method === 'POST' && url.pathname === '/chat') {
      return handleChat(request, env, cors);
    }
    if (request.method === 'POST' && url.pathname === '/notify') {
      return handleNotify(request, env, cors);
    }

    return json({ error: 'not_found' }, { status: 404, headers: cors });
  },
};
