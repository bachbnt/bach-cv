/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

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
