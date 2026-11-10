/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const CSS = readFileSync('src/skins/academic/academic.css', 'utf8');
// the ledge (chalk, markers, the slip) and the viewer (shadows of the photographs) are drawn with the palette, not with their own colours
const FILES = [
  'src/skins/academic/shell/ledge.tsx',
  'src/skins/academic/shell/ac-viewer.tsx',
];
const RAW = /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(|\boklch\(/g;

describe('the colours of the ledge and of the viewer of the Academic skin', () => {
  it.each(FILES)('are all tokens in %s, no hex or rgb literal', (file) => {
    const text = readFileSync(file, 'utf8')
      // the copyright header and comments are not colours
      .replace(/\/\*[\s\S]*?\*\//g, '');
    expect(text.match(RAW) ?? []).toEqual([]);
  });

  it('defines every --ac- token that those files read', () => {
    const used = new Set<string>();
    for (const file of FILES)
      for (const m of readFileSync(file, 'utf8').matchAll(
        /var\(--(ac-[a-z0-9-]+)|\(--(ac-[a-z0-9-]+)\)/g,
      ))
        used.add(m[1] ?? m[2]);
    const defined = new Set(
      [...CSS.matchAll(/^\s*--(ac-[a-z0-9-]+)\s*:/gm)].map((m) => m[1]),
    );
    const missing = [...used].filter((name) => !defined.has(name));
    expect(missing).toEqual([]);
  });
});
