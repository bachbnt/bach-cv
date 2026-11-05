/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { CHAT_PROXY_URL } from '@/lib/chat/chat-api';
import type { MessageInput } from '@/lib/content/schema';

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

/**
 * Tells the site owner by email that a message arrived. The message is already saved in Firestore, so this is only a
 * nudge: it never waits for the answer, never reports a failure and never blocks the visitor.
 */
export function notifyMessage(
  input: MessageInput,
  proxyUrl: string = CHAT_PROXY_URL,
): void {
  const endpoint = notifyEndpoint(proxyUrl);
  if (!endpoint) return;
  const { name, email, topic, message, locale } = input;
  void fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, topic, message, locale }),
    // the page may be left right after sending
    keepalive: true,
  }).catch(() => undefined);
}
