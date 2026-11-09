/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { readFileSync } from 'node:fs';
import postcss from 'postcss';
import { describe, expect, it } from 'vitest';

/** The CSS of the overlays and of the Payment page of the Travel skin. */
const FILES = [
  'src/skins/travel/css/overlays.css',
  'src/skins/travel/css/pages-desk.css',
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

describe('the overlay CSS of the Travel skin', () => {
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
        // `dark` is the class that the theme puts on <html>
        .filter((name) => !name.startsWith('tl-') && name !== 'dark'),
    );
    expect([...new Set(foreign)]).toEqual([]);
  });

  it('uses no raw colour: the palette comes from the --tl- tokens', () => {
    const raw = rules().flatMap((rule) =>
      rule.nodes
        .filter((n): n is postcss.Declaration => n.type === 'decl')
        // `#0000` and `#000` are the opaque and transparent stops of a mask, which has no colour of its own
        .filter(
          (d) =>
            /#[0-9a-f]{3,8}\b|rgba?\(/i.test(d.value) && !/^mask/.test(d.prop),
        )
        .map((d) => `${rule.selector} ${d.prop}`),
    );
    expect(raw).toEqual([]);
  });
});
