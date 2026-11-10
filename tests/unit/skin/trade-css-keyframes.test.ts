/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import postcss from 'postcss';
import { describe, expect, it } from 'vitest';

const DIR = 'src/skins/trade';
const CSS_FILES = [
  `${DIR}/trade.css`,
  ...readdirSync(`${DIR}/css`).map((name) => `${DIR}/css/${name}`),
];

const sources = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sources(path);
    return /\.tsx?$/.test(entry.name) ? [path] : [];
  });

const defined = () => {
  const names: string[] = [];
  for (const file of CSS_FILES)
    postcss
      .parse(readFileSync(file, 'utf8'))
      .walkAtRules(/keyframes$/, (rule) => {
        names.push(rule.params);
      });
  return names;
};

describe('the keyframes of the Trade skin', () => {
  it('never repeat a name: the last one would silently win', () => {
    const names = defined();
    const repeated = names.filter((name, i) => names.indexOf(name) !== i);
    expect(repeated).toEqual([]);
  });

  it('exist for every animation the skin names', () => {
    const names = new Set(defined());
    const named = new Set<string>();
    // the theme: `--animate-tv-pop: tv-pop 240ms ...`
    const theme = readFileSync('src/app/tailwind-theme-trade.css', 'utf8');
    for (const m of theme.matchAll(/--animate-[\w-]+:\s*([\w-]+)\s/g))
      named.add(m[1]);
    // CSS rules: `animation: name ...`
    for (const file of CSS_FILES) {
      const text = readFileSync(file, 'utf8');
      for (const m of text.matchAll(/animation:\s*([a-z][\w-]*)\s/g))
        // `vt-in` and `vt-out` are the view-transition keyframes of globals.css, shared by every skin
        if (m[1] !== 'none' && !m[1].startsWith('vt-')) named.add(m[1]);
    }
    // utilities in the TSX: `animate-[name_1s_...]`
    for (const file of sources(DIR))
      for (const m of readFileSync(file, 'utf8').matchAll(
        /animate-\[([a-z][a-z0-9-]*)_/g,
      ))
        named.add(m[1]);
    const missing = [...named].filter((name) => !names.has(name));
    expect(missing).toEqual([]);
  });

  it('has no keyframes that nothing uses', () => {
    const usedText = [
      ...CSS_FILES,
      'src/app/tailwind-theme-trade.css',
      ...sources(DIR),
    ]
      .map((file) => readFileSync(file, 'utf8'))
      .join('\n');
    const dead = defined().filter(
      (name) =>
        // `animation: name` / `animate-[name_` / `--animate-x: name` / `tv-vt` shorthands all contain the name followed by space, _ or ;
        !new RegExp(`(?<![\\w-])${name}(?=[\\s_;,)])`).test(
          usedText.replace(new RegExp(`@keyframes ${name}\\b`, 'g'), ''),
        ),
    );
    expect(dead).toEqual([]);
  });

  it('never animates box-shadow, size, position, spacing, colour or filter: they repaint or reflow every frame', () => {
    const heavy =
      /^(box-shadow|text-shadow|filter|backdrop-filter|width|height|top|left|right|bottom|inset|margin|padding|border|background|color|outline)/;
    const found: string[] = [];
    for (const file of CSS_FILES)
      postcss
        .parse(readFileSync(file, 'utf8'))
        .walkAtRules(/keyframes$/, (rule) =>
          rule.walkDecls((decl) => {
            if (heavy.test(decl.prop))
              found.push(`${rule.params}: ${decl.prop}`);
          }),
        );
    expect(found).toEqual([]);
  });

  it('draws the ring of the live dot on a pseudo-element that only scales and fades', () => {
    const css = readFileSync(`${DIR}/trade.css`, 'utf8');
    const root = postcss.parse(css);
    const ring = new Set<string>();
    root.walkAtRules('keyframes', (rule) => {
      if (rule.params !== 'tv-ring') return;
      rule.walkDecls((decl) => {
        ring.add(decl.prop);
      });
    });
    expect([...ring].sort()).toEqual(['opacity', 'transform']);
    let dotAnimates = false;
    let ringAnimates = false;
    root.walkRules((rule) => {
      if (/keyframes$/.test((rule.parent as postcss.AtRule)?.name ?? ''))
        return;
      const animation = rule.nodes.some(
        (n) => n.type === 'decl' && n.prop === 'animation',
      );
      if (rule.selector === '.tv-live' && animation) dotAnimates = true;
      if (rule.selector === '.tv-live::after' && animation) ringAnimates = true;
    });
    // the dot itself stands still: the animation is on its ::after, so the dot keeps its size and nothing repaints
    expect(dotAnimates).toBe(false);
    expect(ringAnimates).toBe(true);
  });
});
