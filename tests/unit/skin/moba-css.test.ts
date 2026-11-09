/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { readdirSync, readFileSync } from 'node:fs';
import postcss from 'postcss';
import { describe, expect, it } from 'vitest';

const DIR = 'src/skins/moba';
const FILES = [
  `${DIR}/moba.css`,
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

describe('the CSS of the Moba skin', () => {
  it('keeps every hover style inside @media (hover: hover)', () => {
    const bare = rules().filter((rule) => {
      if (!rule.selector.includes(':hover')) return false;
      for (let n: postcss.Node | undefined = rule.parent; n; n = n.parent)
        if (
          n.type === 'atrule' &&
          /hover\s*:\s*hover/.test((n as postcss.AtRule).params)
        )
          return false;
      return true;
    });
    expect(bare.map((r) => r.selector)).toEqual([]);
  });

  it('gives every class the mb- prefix, so it cannot touch another skin', () => {
    const foreign = rules().flatMap((rule) =>
      [...rule.selector.matchAll(/\.([A-Za-z_][\w-]*)/g)]
        .map((m) => m[1])
        // `dark` is the class that the theme puts on <html>
        .filter((name) => !name.startsWith('mb-') && name !== 'dark'),
    );
    expect([...new Set(foreign)]).toEqual([]);
  });

  it('names its palette with --mb-, never with the names of shadcn tokens', () => {
    const palette = rules()
      .filter((r) =>
        /^html\[data-skin='moba'\](\[data-theme='light'\])?$/.test(r.selector),
      )
      .flatMap((r) =>
        r.nodes.filter((n): n is postcss.Declaration => n.type === 'decl'),
      )
      .map((d) => d.prop)
      .filter((p) => p.startsWith('--mb-'));
    for (const name of [
      '--mb-gold',
      '--mb-title',
      '--mb-m-river-1',
      '--mb-team-red',
    ])
      expect(palette).toContain(name);
  });

  it('defines every colour of the night palette again for the day theme (the ones that must differ)', () => {
    const declared = (selector: string) =>
      rules()
        .filter((r) => r.selector === selector)
        .flatMap((r) =>
          r.nodes.filter((n): n is postcss.Declaration => n.type === 'decl'),
        )
        .map((d) => d.prop);
    const day = declared("html[data-skin='moba'][data-theme='light']");
    for (const name of [
      '--mb-bg',
      '--mb-panel',
      '--mb-ink',
      '--mb-title',
      '--mb-m-floor-1',
    ])
      expect(day).toContain(name);
  });

  it('exposes the palette to Tailwind as utilities', () => {
    const theme = readFileSync('src/app/tailwind-theme-moba.css', 'utf8');
    const used = new Set(
      readFileSync(`${DIR}/moba.css`, 'utf8')
        .match(/--mb-(?!m-)[a-z-]+(?=:)/g)
        // the team colours are used by the map art through var(), and --mb-cut is the size of a corner, not a colour
        ?.filter((n) => !/^--mb-(team-|cut$|font$)/.test(n)),
    );
    const missing = [...used].filter((name) => !theme.includes(`var(${name})`));
    expect(missing).toEqual([]);
  });
});
