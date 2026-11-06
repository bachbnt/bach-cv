/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { FileKind } from '@/skins/dev/config';

// Small drawings for the file types the site has no brand mark for (Java, JavaScript, SQL, JSON, Markdown, shell, YAML), in the colours
// the editors use for them. Static, trusted markup. The brand marks (Kotlin, Dart, Python, React, Swift, TypeScript) come from
// `components/skills/skill-icons.ts`.
export const DRAWN_FILE_ICONS: Partial<Record<FileKind, string>> = {
  js: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect width="24" height="24" rx="2.5" fill="#f7df1e"/><text x="22.5" y="21" text-anchor="end" font-family="Arial,sans-serif" font-weight="700" font-size="13.5" fill="#000">JS</text></svg>',
  java: '<svg viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M10.2 2.4c1.7 1.5-1.3 2.7 0 4.6M13.8 3.4c1.3 1.1-.8 2.2 0 3.6" stroke="#e76f00" stroke-width="1.6"/><path d="M5.2 10.2h11.2l-.9 5.6a3 3 0 0 1-3 2.5H9.1a3 3 0 0 1-3-2.5z" fill="#5382a1" stroke="#5382a1" stroke-width=".6"/><path d="M16.4 11.2c3.2 0 3 4.3-.9 4.3" stroke="#5382a1" stroke-width="1.5"/><path d="M4 21.2h13.6" stroke="#e76f00" stroke-width="1.6"/></g></svg>',
  sql: '<svg viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="#f0b429" stroke-width="1.7"><ellipse cx="12" cy="6" rx="7.5" ry="3"/><path d="M4.5 6v12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3V6M4.5 12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3"/></g></svg>',
  json: '<svg viewBox="0 0 24 24" aria-hidden="true"><text x="12" y="17" text-anchor="middle" font-family="Menlo,Consolas,monospace" font-weight="700" font-size="15" fill="#f5de19">{}</text></svg>',
  md: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="1.8" y="5" width="20.4" height="14" rx="2.2" fill="none" stroke="#519aba" stroke-width="1.7"/><path d="M5.2 15V9l2.8 3.4L10.8 9v6M17.2 9v5.2m0 0-2-2.2m2 2.2 2-2.2" fill="none" stroke="#519aba" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  sh: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="1.5" y="4" width="21" height="16" rx="3" fill="#4d5a5e"/><path d="m6 9.5 3.2 2.5L6 14.5M11.5 15h5.5" fill="none" stroke="#7ee787" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  yaml: '<svg viewBox="0 0 24 24" aria-hidden="true"><text x="12" y="16.5" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="10" fill="#ff5252">yml</text></svg>',
};
