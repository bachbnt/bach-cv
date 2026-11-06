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
): Promise<string> => {
  const key = ensureKey(apiKey, 'Gemini');
  // the key goes in a header, not in the URL, so it does not end up in logs
  const response = await fetch(model ? geminiUrl(model) : GEMINI_URL, {
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
  });
  const data = (await handleProviderResponse(
    response,
    'Gemini',
  )) as GeminiReply;
  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '...';
};

export const callOpenAI = async (
  apiKey: string | undefined,
  messages: ChatMessage[],
  systemPrompt: string,
  model: string = OPENAI_MODEL,
): Promise<string> => {
  const key = ensureKey(apiKey, 'OpenAI');
  const response = await fetch(OPENAI_URL, {
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
  });
  const data = (await handleProviderResponse(
    response,
    'OpenAI',
  )) as OpenAIReply;
  return data?.choices?.[0]?.message?.content ?? '...';
};

export const callClaude = async (
  apiKey: string | undefined,
  messages: ChatMessage[],
  systemPrompt: string,
  model: string = ANTHROPIC_MODEL,
): Promise<string> => {
  const key = ensureKey(apiKey, 'Anthropic');
  const response = await fetch(ANTHROPIC_URL, {
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
  });
  const data = (await handleProviderResponse(
    response,
    'Anthropic',
  )) as AnthropicReply;
  return data?.content?.[0]?.text ?? '...';
};

/** Workers AI: no API key, it runs on the account's free daily allowance. A spent allowance answers 429. */
export const callCloudflareAI = async (
  ai: AiBinding | undefined,
  messages: ChatMessage[],
  systemPrompt: string,
  model: string = DEFAULT_CLOUDFLARE_MODEL,
): Promise<string> => {
  if (!ai) throw new HttpError(500, 'Missing Workers AI binding');
  let output: unknown;
  try {
    output = await ai.run(model, {
      max_tokens: MAX_OUTPUT_TOKENS,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map((m) => ({
          role: m.role === 'model' ? 'assistant' : 'user',
          content: m.content,
        })),
      ],
    });
  } catch (error) {
    const reason = String((error as Error)?.message ?? error);
    throw new HttpError(
      /limit|quota|capacity|neuron|429/i.test(reason) ? 429 : 502,
      'Workers AI error',
    );
  }
  const text = (output as { response?: unknown } | null)?.response;
  return typeof text === 'string' && text.trim() ? text : '...';
};
