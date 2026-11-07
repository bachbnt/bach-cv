/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { readdirSync, readFileSync } from 'node:fs';
import postcss from 'postcss';
import { describe, expect, it } from 'vitest';

const DIR = 'src/skins/trade';
const FILES = [
  `${DIR}/trade.css`,
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

describe('the CSS of the Trade skin', () => {
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

  it('gives every class the tv- prefix, so it cannot touch another skin', () => {
    const foreign = rules().flatMap((rule) =>
      [...rule.selector.matchAll(/\.([A-Za-z_][\w-]*)/g)]
        .map((m) => m[1])
        // `dark` is the class that the theme puts on <html>
        .filter((name) => !name.startsWith('tv-') && name !== 'dark'),
    );
    expect([...new Set(foreign)]).toEqual([]);
  });

  it('names its palette with --tv-, never with the names of shadcn tokens', () => {
    const palette = rules()
      .filter((r) =>
        /^html\[data-skin='trade'\](:not\(\.dark\))?$/.test(r.selector),
      )
      .flatMap((r) =>
        r.nodes.filter((n): n is postcss.Declaration => n.type === 'decl'),
      )
      .map((d) => d.prop)
      .filter((p) => p.startsWith('--tv-'));
    expect(palette).toContain('--tv-up');
    expect(palette).toContain('--tv-accent');
  });
});
