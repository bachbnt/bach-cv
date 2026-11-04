/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { WORKER_LIMITS, type WireMessage } from './chat-api';

export interface ChatEntry {
  id: string;
  /** `error` entries are shown, never sent; their `content` is the error kind, worded by the copy of the moment */
  role: 'user' | 'bot' | 'error';
  content: string;
}

export const countUserMessages = (entries: ChatEntry[]): number =>
  entries.filter((e) => e.role === 'user').length;

/**
 * The conversation as the Worker wants it.
 * - the greeting and error notes are not part of it (they are never stored as entries / are dropped here);
 * - Claude and Gemini need a conversation that starts with the visitor, so it is trimmed to start with a user turn;
 * - two turns in a row from one side (a failed question followed by another) are merged;
 * - the Worker refuses turns over 2000 characters and more than 40 turns, and a long reply would break the next question.
 */
export const toWireMessages = (entries: ChatEntry[]): WireMessage[] => {
  const merged: WireMessage[] = [];
  for (const entry of entries) {
    if (entry.role === 'error') continue;
    const role = entry.role === 'user' ? 'user' : 'model';
    const content = entry.content.trim().slice(0, WORKER_LIMITS.contentLength);
    if (!content) continue;
    const last = merged[merged.length - 1];
    if (last?.role === role) {
      last.content = `${last.content}\n\n${content}`.slice(
        0,
        WORKER_LIMITS.contentLength,
      );
    } else {
      merged.push({ role, content });
    }
  }
  const recent = merged.slice(-WORKER_LIMITS.messages);
  const firstUser = recent.findIndex((m) => m.role === 'user');
  return firstUser < 0 ? [] : recent.slice(firstUser);
};
