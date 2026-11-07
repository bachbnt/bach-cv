/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { readdirSync, readFileSync } from 'node:fs';
import postcss from 'postcss';
import { describe, expect, it } from 'vitest';

const DIR = 'src/skins/stream';
const FILES = [
  `${DIR}/stream.css`,
  ...readdirSync(`${DIR}/css`).map((name) => `${DIR}/css/${name}`),
];

const rules = () => {
  const found: postcss.Rule[] = [];
  for (const file of FILES) {
    postcss.parse(readFileSync(file, 'utf8')).walkRules((rule) => {
      const parent = rule.parent;
      if (
        parent?.type === 'atrule' &&
        /keyframes$/.test((parent as postcss.AtRule).name)
      )
        return;
      found.push(rule);
    });
  }
  return found;
};

describe('the CSS of the Stream skin', () => {
  it('keeps every hover style inside @media (hover: hover)', () => {
    const bare = rules().filter((rule) => {
      if (!rule.selector.includes(':hover')) return false;
      for (
        let node: postcss.Node | undefined = rule.parent;
        node;
        node = node.parent
      ) {
        if (
          node.type === 'atrule' &&
          /hover\s*:\s*hover/.test((node as postcss.AtRule).params)
        )
          return false;
      }
      return true;
    });
    expect(bare.map((rule) => rule.selector)).toEqual([]);
  });

  it('gives every class the sm- prefix, so it cannot touch another skin', () => {
    const foreign: string[] = [];
    for (const rule of rules()) {
      for (const match of rule.selector.matchAll(/\.([A-Za-z_][\w-]*)/g)) {
        // `dark` is the class that the theme puts on <html>
        if (!match[1].startsWith('sm-') && match[1] !== 'dark')
          foreign.push(match[1]);
      }
    }
    expect([...new Set(foreign)]).toEqual([]);
  });

  it('scopes every rule to the skin', () => {
    const loose = rules()
      .map((rule) => rule.selector)
      .filter(
        (selector) =>
          !/html\[data-skin='stream'\]|\.sm-root|\.sm-/.test(selector),
      );
    expect(loose).toEqual([]);
  });

  it('does not use the names of shadcn tokens for its own palette', () => {
    const css = readFileSync(`${DIR}/stream.css`, 'utf8');
    expect(css).not.toMatch(/\s--accent\s*:\s*#/);
    expect(css).not.toMatch(/\s--muted\s*:\s*#/);
    for (const name of css.matchAll(/^\s*(--sm-[\w-]+)\s*:/gm))
      expect(name[1].startsWith('--sm-')).toBe(true);
  });

  it('defines every palette token for both themes', () => {
    const css = readFileSync(`${DIR}/stream.css`, 'utf8');
    const theme = readFileSync('src/app/tailwind-theme-stream.css', 'utf8');
    for (const match of theme.matchAll(/var\((--sm-[\w-]+)\)/g))
      expect(css).toContain(`${match[1]}:`);
  });
});
