/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ChatEntry } from '@/lib/chat/messages';

export interface Suggestion {
  id: string;
  text: string;
}

/**
 * The questions from `site/settings`, or the built-in ones (already in the visitor's language)
 * while that document has none. Settings carry no translations, so they are shown as written.
 */
export const resolveSuggestions = (
  configured: Suggestion[],
  defaults: readonly Suggestion[],
): Suggestion[] => {
  const usable = configured.filter((s) => s.text.trim());
  return usable.length > 0 ? usable : [...defaults];
};

/** The questions the visitor has not asked yet (the chat offers them after each answer); a question is "asked" when a message says it word for word. */
export const remainingSuggestions = (
  entries: Pick<ChatEntry, 'role' | 'content'>[],
  suggestions: Suggestion[],
): Suggestion[] => {
  const asked = new Set(
    entries.filter((e) => e.role === 'user').map((e) => e.content),
  );
  return suggestions.filter((s) => !asked.has(s.text));
};
