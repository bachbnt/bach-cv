/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const DEV = 'src/skins/dev';

const sources = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? sources(join(dir, entry.name))
      : /\.tsx$/.test(entry.name)
        ? [join(dir, entry.name)]
        : [],
  );

/** The chat button and window are fixed to the window, so they are never scrolled out of view: the background tab (`data-hidden` on the root) is what stops them. */
const FIXED = /shell\/(dev-chat\.tsx|chat\/)/;

describe('the endless loops of the Dev skin', () => {
  const looping = sources(DEV).filter((file) =>
    readFileSync(file, 'utf8').includes('infinite'),
  );

  it('are found', () => {
    expect(looping.length).toBeGreaterThanOrEqual(5);
  });

  it('are gated by useLoopGate, or are fixed under the root that pauses them in a background tab', () => {
    for (const file of looping) {
      const text = readFileSync(file, 'utf8');
      expect(
        FIXED.test(file) || text.includes('useLoopGate'),
        `${file} has an endless animation that never waits`,
      ).toBe(true);
    }
  });

  it('are paused by dev-extra.css in a background tab and while scrolled out of view', () => {
    const css = readFileSync(join(DEV, 'dev-extra.css'), 'utf8');
    expect(css).toMatch(/\.dv-root\[data-hidden\] \*/);
    expect(css).toMatch(/\.dv-root \[data-off\] \*/);
    expect(css).toMatch(/animation-play-state:\s*paused !important/);
  });

  it('the root says when the tab is in the background', () => {
    const root = readFileSync(join(DEV, 'ui/dev-root.tsx'), 'utf8');
    expect(root).toContain('useDocumentHidden');
    expect(root).toContain('data-hidden');
  });
});
