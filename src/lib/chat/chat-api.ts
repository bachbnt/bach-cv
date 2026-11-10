/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { z } from 'zod';
import type { Lang } from '@/lib/content/schema';

/** The Worker URL (see worker/README.md). Empty means the assistant is switched off. */
export const CHAT_PROXY_URL = process.env.NEXT_PUBLIC_CHAT_PROXY_URL ?? '';

/** Limits of the Worker's request schema (worker/src/schema.ts). */
export const WORKER_LIMITS = {
  messages: 40,
  contentLength: 2000,
} as const;

const TIMEOUT_MS = 40_000;

export interface WireMessage {
  role: 'user' | 'model';
  content: string;
}

export type ChatErrorKind =
  'unavailable' | 'rate-limit' | 'daily-limit' | 'network' | 'server';

export class ChatError extends Error {
  constructor(
    public kind: ChatErrorKind,
    message = kind,
  ) {
    super(message);
  }
}

/**
 * The endpoint for a configured URL. Both `https://x.workers.dev` and `https://x.workers.dev/chat`
 * are accepted, because the README only says "copy the deployed URL".
 */
export const chatEndpoint = (base: string): string | null => {
  const trimmed = base.trim().replace(/\/+$/, '');
  if (!trimmed) return null;
  return trimmed.endsWith('/chat') ? trimmed : `${trimmed}/chat`;
};

const responseSchema = z.object({ text: z.string() });
const errorSchema = z.object({ error: z.string().optional() });

/** Maps a Worker error response to what the visitor needs to know. */
export const errorKindOf = (status: number, code: string | undefined) => {
  if (status === 429) {
    return code === 'rate_limit_day' ? 'daily-limit' : 'rate-limit';
  }
  return 'server';
};

/** Sends the conversation through the Worker and returns the reply text. Throws `ChatError`. */
export async function sendChat(
  body: { messages: WireMessage[]; lang: Lang },
  options: { proxyUrl?: string; signal?: AbortSignal } = {},
): Promise<string> {
  const endpoint = chatEndpoint(options.proxyUrl ?? CHAT_PROXY_URL);
  if (!endpoint) throw new ChatError('unavailable');

  const timeout = AbortSignal.timeout(TIMEOUT_MS);
  const signal = options.signal
    ? AbortSignal.any([options.signal, timeout])
    : timeout;

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // no provider: the Worker tries its enabled ones in order (Workers AI first, Gemini as the fallback)
      body: JSON.stringify(body),
      signal,
    });
  } catch {
    throw new ChatError('network');
  }

  if (!response.ok) {
    const parsed = errorSchema.safeParse(
      await response.json().catch(() => ({})),
    );
    throw new ChatError(
      errorKindOf(
        response.status,
        parsed.success ? parsed.data.error : undefined,
      ),
    );
  }

  const data = responseSchema.safeParse(
    await response.json().catch(() => null),
  );
  if (!data.success || !data.data.text.trim()) throw new ChatError('server');
  return data.data.text;
}
