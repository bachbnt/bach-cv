/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const files = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const path = `${dir}/${name}`;
    return statSync(path).isDirectory()
      ? files(path)
      : path.endsWith('.tsx')
        ? [path]
        : [];
  });

describe('the layout of the Travel skin', () => {
  it('gives every grid its columns: a bare grid grows its column to its widest child and pushes text out of the card', () => {
    const bare: string[] = [];
    for (const file of files('src/skins/travel'))
      for (const [literal] of readFileSync(file, 'utf8').matchAll(
        /'[^'\n]*'/g,
      )) {
        const tokens = literal.slice(1, -1).split(' ');
        if (
          tokens.includes('grid') &&
          !tokens.some((t) => /^(grid-(cols|rows)|place-items)/.test(t))
        )
          bare.push(`${file}: ${literal}`);
      }
    expect(bare).toEqual([]);
  });
});
