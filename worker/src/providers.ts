/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ChatMessage } from './schema';

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_MODEL = 'gpt-4o-mini';
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_MODEL = 'claude-haiku-4-5-20251001';
const ANTHROPIC_VERSION = '2023-06-01';

/** The longest answer any provider may write, so one request cannot run up a large bill. */
export const MAX_OUTPUT_TOKENS = 1024;

/** How long one provider may take, from the request to the last byte of its answer, before the next one is tried. */
export const PROVIDER_TIMEOUT_MS = 8_000;

const geminiUrl = (model: string): string =>
  `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

/** The `AI` binding of a Worker (see wrangler.toml). Only `run` is used. */
export interface AiBinding {
  run(model: string, input: unknown): Promise<unknown>;
}

/** Any model of the Workers AI catalog can be set with CLOUDFLARE_AI_MODEL; check the catalog for current names. */
export const DEFAULT_CLOUDFLARE_MODEL = '@cf/meta/llama-3.1-8b-instruct-fp8';

const ensureKey = (key: string | undefined, providerName: string): string => {
  if (!key) throw new HttpError(500, `Missing ${providerName} API key`);
  return key;
};

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

/** A provider that did not answer in time: like any failure it moves the chat on to the next one, and the visitor is told only `upstream_error`. */
const timedOut = () => new HttpError(504, 'upstream_timeout');

/**
 * The request and the reading of its answer, under one deadline: a provider that never answers (or answers the headers and then stops) is
 * cut off at `timeoutMs` and the request is aborted, so nothing keeps running for a visitor who has long been given the next answer.
 */
const requestJson = async (
  url: string,
  init: RequestInit,
  providerName: string,
  timeoutMs: number,
): Promise<unknown> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    return await handleProviderResponse(response, providerName);
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw controller.signal.aborted
      ? timedOut()
      : new HttpError(502, `${providerName} unreachable`);
  } finally {
    clearTimeout(timer);
  }
};

/** `work` under a deadline, for a call that cannot be aborted (the Workers AI binding): the answer that comes late is dropped. */
const within = <T>(work: Promise<T>, timeoutMs: number): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(timedOut()), timeoutMs);
    work.then(resolve, reject).finally(() => clearTimeout(timer));
  });

const handleProviderResponse = async (
  response: Response,
  providerName: string,
): Promise<unknown> => {
  if (response.status === 429) throw new HttpError(429, 'rate_limit');
  if (!response.ok) {
    throw new HttpError(response.status, `${providerName} upstream error`);
  }
  return response.json();
};

/** The part of each provider's answer that is read; anything else in the JSON is ignored, and a missing part gives `...`. */
type GeminiReply = {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
};
type OpenAIReply = { choices?: { message?: { content?: string } }[] };
type AnthropicReply = { content?: { text?: string }[] };

export const callGemini = async (
  apiKey: string | undefined,
  messages: ChatMessage[],
  systemPrompt: string,
  model?: string,
  timeoutMs: number = PROVIDER_TIMEOUT_MS,
): Promise<string> => {
  const key = ensureKey(apiKey, 'Gemini');
  // the key goes in a header, not in the URL, so it does not end up in logs
  const data = (await requestJson(
    model ? geminiUrl(model) : GEMINI_URL,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        generationConfig: { maxOutputTokens: MAX_OUTPUT_TOKENS },
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: messages.map((m) => ({
          role: m.role,
          parts: [{ text: m.content }],
        })),
      }),
    },
    'Gemini',
    timeoutMs,
  )) as GeminiReply;
  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '...';
};

export const callOpenAI = async (
  apiKey: string | undefined,
  messages: ChatMessage[],
  systemPrompt: string,
  model: string = OPENAI_MODEL,
  timeoutMs: number = PROVIDER_TIMEOUT_MS,
): Promise<string> => {
  const key = ensureKey(apiKey, 'OpenAI');
  const data = (await requestJson(
    OPENAI_URL,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        max_tokens: MAX_OUTPUT_TOKENS,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map((m) => ({
            role: m.role === 'model' ? 'assistant' : 'user',
            content: m.content,
          })),
        ],
      }),
    },
    'OpenAI',
    timeoutMs,
  )) as OpenAIReply;
  return data?.choices?.[0]?.message?.content ?? '...';
};

export const callClaude = async (
  apiKey: string | undefined,
  messages: ChatMessage[],
  systemPrompt: string,
  model: string = ANTHROPIC_MODEL,
  timeoutMs: number = PROVIDER_TIMEOUT_MS,
): Promise<string> => {
  const key = ensureKey(apiKey, 'Anthropic');
  const data = (await requestJson(
    ANTHROPIC_URL,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model,
        max_tokens: MAX_OUTPUT_TOKENS,
        system: systemPrompt,
        messages: messages.map((m) => ({
          role: m.role === 'model' ? 'assistant' : 'user',
          content: m.content,
        })),
      }),
    },
    'Anthropic',
    timeoutMs,
  )) as AnthropicReply;
  return data?.content?.[0]?.text ?? '...';
};

/** Workers AI: no API key, it runs on the account's free daily allowance. A spent allowance answers 429. */
export const callCloudflareAI = async (
  ai: AiBinding | undefined,
  messages: ChatMessage[],
  systemPrompt: string,
  model: string = DEFAULT_CLOUDFLARE_MODEL,
  timeoutMs: number = PROVIDER_TIMEOUT_MS,
): Promise<string> => {
  if (!ai) throw new HttpError(500, 'Missing Workers AI binding');
  let output: unknown;
  try {
    output = await within(
      ai.run(model, {
        max_tokens: MAX_OUTPUT_TOKENS,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map((m) => ({
            role: m.role === 'model' ? 'assistant' : 'user',
            content: m.content,
          })),
        ],
      }),
      timeoutMs,
    );
  } catch (error) {
    if (error instanceof HttpError) throw error;
    const reason = String((error as Error)?.message ?? error);
    throw new HttpError(
      /limit|quota|capacity|neuron|429/i.test(reason) ? 429 : 502,
      'Workers AI error',
    );
  }
  const text = (output as { response?: unknown } | null)?.response;
  return typeof text === 'string' && text.trim() ? text : '...';
};
