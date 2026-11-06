/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { Page, Route } from '@playwright/test';

/** The Playwright config sets NEXT_PUBLIC_CHAT_PROXY_URL to this address, so the chat and the contact form talk to a stub. */
const PROXY = 'http://localhost:9999/chat';
const NOTIFY = 'http://localhost:9999/notify';
const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'content-type',
  'access-control-allow-methods': 'POST, OPTIONS',
};

export type ChatBody = {
  provider?: string;
  systemPrompt: string;
  messages: { role: string; content: string }[];
};

/** Stands in for the Worker's /chat. `reply` decides each answer; the bodies it received are returned. */
export async function mockWorker(
  page: Page,
  reply: (
    n: number,
    body: ChatBody,
  ) => { status?: number; body: unknown; delay?: number },
) {
  const received: ChatBody[] = [];
  await page.route(PROXY, async (route: Route) => {
    const request = route.request();
    if (request.method() === 'OPTIONS') {
      return route.fulfill({ status: 204, headers: CORS });
    }
    const body = request.postDataJSON() as ChatBody;
    received.push(body);
    const out = reply(received.length, body);
    if (out.delay) await new Promise((r) => setTimeout(r, out.delay));
    return route.fulfill({
      status: out.status ?? 200,
      headers: { ...CORS, 'content-type': 'application/json' },
      body: JSON.stringify(out.body),
    });
  });
  return received;
}

/** The Worker's /notify, answering with `status` and recording what it was sent. */
export async function mockNotify(page: Page, status = 200) {
  const received: Record<string, unknown>[] = [];
  await page.route(NOTIFY, async (route) => {
    const request = route.request();
    if (request.method() === 'OPTIONS')
      return route.fulfill({ status: 204, headers: CORS });
    received.push(request.postDataJSON() as Record<string, unknown>);
    return route.fulfill({
      status,
      headers: { ...CORS, 'content-type': 'application/json' },
      body: JSON.stringify({ ok: status === 200, sent: status === 200 }),
    });
  });
  return received;
}
