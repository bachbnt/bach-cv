/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { CHAT_PROXY_URL } from '@/lib/chat/chat-api';
import type { MessageInput } from '@/lib/content/schema';
import { getTurnstileToken, TURNSTILE_SITE_KEY } from '@/lib/turnstile';

/**
 * The Worker's `/notify` address for a configured URL. The same URL as the chat is used
 * (`https://x.workers.dev` or `https://x.workers.dev/chat`), so no second setting is needed.
 */
export const notifyEndpoint = (base: string): string | null => {
  const trimmed = base
    .trim()
    .replace(/\/+$/, '')
    .replace(/\/(chat|notify)$/, '');
  return trimmed ? `${trimmed}/notify` : null;
};

/** The body of the `/notify` request: the message, and the Turnstile token when there is one. */
export const notifyBody = (
  input: MessageInput,
  turnstileToken?: string | null,
): Record<string, string | undefined> => {
  const { name, email, topic, message, locale } = input;
  return {
    name,
    email,
    topic,
    message,
    locale,
    ...(turnstileToken ? { turnstileToken } : {}),
  };
};

const post = (endpoint: string, body: Record<string, string | undefined>) =>
  void fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    // the page may be left right after sending
    keepalive: true,
  }).catch(() => undefined);

/**
 * Tells the site owner by email that a message arrived. The message is already saved in Firestore, so this is only a
 * nudge: it never waits for the answer, never reports a failure and never blocks the visitor.
 * With a Turnstile site key the request waits (in the background, at most a few seconds) for the invisible check, so the Worker can
 * verify it; without a token, or without a key, it is sent as it is and the Worker decides.
 */
export function notifyMessage(
  input: MessageInput,
  proxyUrl: string = CHAT_PROXY_URL,
  siteKey: string = TURNSTILE_SITE_KEY,
): void {
  const endpoint = notifyEndpoint(proxyUrl);
  if (!endpoint) return;
  if (!siteKey) {
    post(endpoint, notifyBody(input));
    return;
  }
  void getTurnstileToken(siteKey).then((token) =>
    post(endpoint, notifyBody(input, token)),
  );
}
