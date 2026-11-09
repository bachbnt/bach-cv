/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const DIR = 'src/skins/trade';
const THEME = readFileSync('src/app/tailwind-theme-trade.css', 'utf8');
const THEME_NAMES = new Set(
  [...THEME.matchAll(/--([a-z]+)-tv-([a-z][a-z0-9-]*)\s*:/g)].map(
    (m) => `${m[1]}:${m[2]}`,
  ),
);

const sources = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sources(path);
    return /\.tsx?$/.test(entry.name) ? [path] : [];
  });

/** Every `<utility>-tv-<name>` in the class names of the skin, with the theme namespace the utility reads. */
const used = () => {
  const found = new Map<string, Set<string>>();
  const utility =
    /(?<![\w-])(bg|text|fill|stroke|border(?:-[xytblrse])?|ring|from|to|via|outline|shadow|divide|decoration|caret|accent|ease|animate)-tv-([a-z][a-z0-9-]*)/g;
  for (const file of sources(DIR)) {
    const text = readFileSync(file, 'utf8');
    for (const m of text.matchAll(utility)) {
      const kind = m[1];
      const namespace =
        kind === 'ease' || kind === 'animate' || kind === 'shadow'
          ? [kind, 'color'].filter((n) => !(kind !== 'shadow' && n === 'color'))
          : ['color'];
      const key = `${namespace.join('|')}:${m[2]}`;
      if (!found.has(key)) found.set(key, new Set());
      found.get(key)!.add(file);
    }
  }
  return found;
};

describe('the theme colours the Trade skin uses', () => {
  it('has a --color-tv-<name> (or the shadow, ease or animate token) for every tv- utility in the TSX', () => {
    const missing = [...used()].flatMap(([key, files]) => {
      const [namespaces, name] = key.split(':');
      return namespaces
        .split('|')
        .some((ns) => THEME_NAMES.has(`${ns}:${name}`))
        ? []
        : [`${key} in ${[...files].join(', ')}`];
    });
    // a class with no theme token is silently dropped by Tailwind (bg-tv-night/80 once was)
    expect(missing).toEqual([]);
  });

  it('keeps the ink and solid colours next to their bright ones', () => {
    for (const name of ['up', 'down', 'gold', 'sky', 'orange', 'violet'])
      expect(THEME_NAMES.has(`color:${name}-ink`), `${name}-ink`).toBe(true);
    expect(THEME_NAMES.has('color:up-solid')).toBe(true);
    expect(THEME_NAMES.has('color:down-solid')).toBe(true);
  });

  it('defines the motion scale once: the two curves and the shadows', () => {
    expect(THEME_NAMES.has('ease:out')).toBe(true);
    expect(THEME_NAMES.has('ease:state')).toBe(true);
    expect(THEME_NAMES.has('shadow:card')).toBe(true);
    expect(THEME_NAMES.has('shadow:paper')).toBe(true);
  });
});
