/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/** A short, stable, made-up commit hash for a string: the Source Control look of a role. */
export function shortHash(text: string): string {
  let h = 2166136261;
  for (const c of text) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return (h >>> 0).toString(16).padStart(7, '0').slice(0, 7);
}
