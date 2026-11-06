/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import postcss from 'postcss';
import { describe, expect, it } from 'vitest';

const DEV = 'src/skins/dev';
const files = [
  join(DEV, 'dev.css'),
  join(DEV, 'dev-extra.css'),
  ...readdirSync(join(DEV, 'css')).map((name) => join(DEV, 'css', name)),
];

const rulesOf = (file: string) => {
  const rules: postcss.Rule[] = [];
  postcss.parse(readFileSync(file, 'utf8')).walkRules((rule) => {
    const parent = rule.parent;
    if (
      parent?.type === 'atrule' &&
      /keyframes$/.test((parent as postcss.AtRule).name)
    )
      return;
    rules.push(rule);
  });
  return rules;
};

describe('the CSS of the Dev skin', () => {
  it('keeps every hover style inside @media (hover: hover)', () => {
    const bare: string[] = [];
    for (const file of files) {
      for (const rule of rulesOf(file)) {
        if (!rule.selector.includes(':hover')) continue;
        let inside = false;
        for (
          let node: postcss.Node | undefined = rule.parent;
          node;
          node = node.parent
        ) {
          if (
            node.type === 'atrule' &&
            /hover\s*:\s*hover/.test((node as postcss.AtRule).params)
          )
            inside = true;
        }
        if (!inside) bare.push(`${file}: ${rule.selector}`);
      }
    }
    expect(bare).toEqual([]);
  });

  it('gives every class the dv- prefix, so it cannot touch another skin', () => {
    const foreign: string[] = [];
    for (const file of files) {
      for (const rule of rulesOf(file)) {
        for (const match of rule.selector.matchAll(/\.([A-Za-z_][\w-]*)/g)) {
          // `dark` is the class that the theme puts on <html>
          if (!match[1].startsWith('dv-') && match[1] !== 'dark')
            foreign.push(`${file}: .${match[1]}`);
        }
      }
    }
    expect([...new Set(foreign)]).toEqual([]);
  });

  it('does not use the names of shadcn tokens for its own palette', () => {
    const css = readFileSync(join(DEV, 'dev.css'), 'utf8');
    expect(css).not.toMatch(/--accent\s*:/);
    expect(css).not.toMatch(/--muted\s*:/);
  });
});
