/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const DIR = 'src/skins/phone';
const THEME = 'src/app/tailwind-theme-phone.css';

const tsxFiles = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return tsxFiles(path);
    return /\.tsx?$/.test(name) ? [path] : [];
  });

/** The code of a file without its comments (the words "rounded tile" in a comment are not a class). */
const codeOf = (file: string) =>
  readFileSync(file, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|\s)\/\/[^\n]*/g, '$1');

/** A corner utility: `rounded`, `rounded-t-xl`, `rounded-[1.4rem]`, `rounded-ph-panel`, with or without a side. */
const RADIUS =
  /(?<![\w-])rounded(?:-(?:[trbl]|tl|tr|bl|br|s|e))?(?:-([^\s'"`]+))?(?=[\s'"`]|$)/g;

/**
 * The few radii that are not on the scale, each with the reason. Everything else is `rounded-ph-*`, `rounded-full` or `rounded-none`.
 */
const ALLOWED = new Map([
  [
    '[30%]',
    'the squircle of an app tile: a share of its side, so it scales with the tile',
  ],
  ['[inherit]', 'a layer inside a card that has the corners of the card'],
  [
    '[0.3rem]',
    'the tail corner of a chat bubble, which is what makes it a speech bubble',
  ],
]);

describe('the corners of the Phone skin', () => {
  const theme = readFileSync(THEME, 'utf8');
  const tokens = new Set(
    [...theme.matchAll(/--radius-(ph-[a-z0-9-]+):/g)].map((m) => m[1]),
  );

  it('uses one scale: no raw rem radius and no stock size (xl, 2xl, md...) in a class', () => {
    const found: string[] = [];
    for (const file of tsxFiles(DIR)) {
      const text = codeOf(file);
      for (const m of text.matchAll(RADIUS)) {
        const size = m[1];
        if (size === undefined) found.push(`${file}: ${m[0]}`);
        else if (
          size === 'full' ||
          size === 'none' ||
          size.startsWith('ph-') ||
          ALLOWED.has(size)
        )
          continue;
        else found.push(`${file}: ${m[0]}`);
      }
    }
    expect(found).toEqual([]);
  });

  it('has a theme radius for every rounded-ph-* utility that the skin uses (a name defined only as a variable silently makes no class)', () => {
    const used = new Set<string>();
    for (const file of tsxFiles(DIR))
      for (const m of codeOf(file).matchAll(RADIUS))
        if (m[1]?.startsWith('ph-')) used.add(m[1]);
    expect([...used].filter((name) => !tokens.has(name))).toEqual([]);
  });

  it('keeps every radius token in use, so the scale has no spare steps', () => {
    const used = new Set<string>();
    for (const file of tsxFiles(DIR))
      for (const m of codeOf(file).matchAll(RADIUS))
        if (m[1]?.startsWith('ph-')) used.add(m[1]);
    expect([...tokens].filter((name) => !used.has(name))).toEqual([]);
  });
});
