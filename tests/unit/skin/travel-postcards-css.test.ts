/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { readFileSync } from 'node:fs';
import postcss from 'postcss';
import { describe, expect, it } from 'vitest';

const FILE = 'src/skins/travel/css/pages-postcards.css';

const rules = () => {
  const found: postcss.Rule[] = [];
  postcss.parse(readFileSync(FILE, 'utf8')).walkRules((rule) => {
    const parent = rule.parent;
    if (
      parent?.type === 'atrule' &&
      /keyframes$/.test((parent as postcss.AtRule).name)
    )
      return;
    found.push(rule);
  });
  return found;
};

describe('the CSS of the postcards, the passport and the tours', () => {
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

  it('gives every class the tl- prefix, so it cannot touch another skin', () => {
    const foreign = rules().flatMap((rule) =>
      [...rule.selector.matchAll(/\.([A-Za-z_][\w-]*)/g)]
        .map((m) => m[1])
        .filter((name) => !name.startsWith('tl-')),
    );
    expect([...new Set(foreign)]).toEqual([]);
  });

  it('writes no hex colour in a rule (colours are the tokens of the skin)', () => {
    const colours = rules().flatMap((rule) =>
      rule.nodes
        .filter((n): n is postcss.Declaration => n.type === 'decl')
        .filter((d) => /#[0-9a-f]{3,8}\b/i.test(d.value))
        .map((d) => `${rule.selector} ${d.prop}`),
    );
    expect(colours).toEqual([]);
  });
});
