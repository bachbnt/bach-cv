/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { z } from 'zod';
import { langSchema } from '@/lib/content/schema';

export const chatProviderSchema = z.enum([
  'cloudflare',
  'gemini',
  'openai',
  'claude',
]);
export type ChatProvider = z.infer<typeof chatProviderSchema>;

export const chatMessageSchema = z.object({
  id: z.string().max(64).optional(),
  role: z.enum(['user', 'model']),
  content: z.string().min(1).max(2000),
});
export type ChatMessage = z.infer<typeof chatMessageSchema>;

export const chatRequestSchema = z.object({
  /** leave out to let the Worker try its enabled providers in order */
  provider: chatProviderSchema.optional(),
  messages: z.array(chatMessageSchema).min(1).max(40),
  /**
   * The visitor's language. The Worker builds the system prompt itself, so a `systemPrompt` in the body (an older site still sends one)
   * is not part of the schema: Zod drops unknown keys, and it is never read.
   */
  lang: langSchema.catch('en'),
});
export type ChatRequest = z.infer<typeof chatRequestSchema>;

/** A contact-form message to be told about by email. The same limits as the Firestore rules for `messages`. */
export const notifyRequestSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z
    .string()
    .trim()
    .max(254)
    .regex(/^[^@\s]+@[^@\s]+\.[^@\s]+$/),
  topic: z.string().max(40).optional(),
  message: z.string().trim().min(1).max(1000),
  locale: z.enum(['en', 'vi']).optional(),
  /** the Cloudflare Turnstile token (at most 2048 characters); needed only when the Worker has a `TURNSTILE_SECRET` */
  turnstileToken: z.string().max(2048).optional(),
});
export type NotifyRequest = z.infer<typeof notifyRequestSchema>;

export const chatResponseSchema = z.object({
  text: z.string(),
});
export type ChatResponse = z.infer<typeof chatResponseSchema>;
