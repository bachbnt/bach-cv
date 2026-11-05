/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { z } from 'zod';

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
  systemPrompt: z.string().min(1).max(8000),
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
});
export type NotifyRequest = z.infer<typeof notifyRequestSchema>;

export const chatResponseSchema = z.object({
  text: z.string(),
});
export type ChatResponse = z.infer<typeof chatResponseSchema>;
