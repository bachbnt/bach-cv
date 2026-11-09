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

// Paper that is not on the board: the sheet component itself, the paper of the windows and the menus, the toast, and the loading placeholders.
const NOT_ON_THE_BOARD =
  /(ui\/ac-paper|ui\/ac-menu|shell\/|-skeleton)\.?[a-z]*(\.tsx)?$|shell\//;

describe('the wind of the Academic board', () => {
  it('lifts every sheet that is written with the paper class by hand, as AcPaper does by default', () => {
    const missing = files('src/skins/academic')
      .filter((file) => !NOT_ON_THE_BOARD.test(file))
      .filter((file) => {
        const text = readFileSync(file, 'utf8').replace(/^import .*$/gm, '');
        // a bare `ac-paper` in a class string, not `ac-paper-` or a mention in a comment
        return /['"`][^'"`\n]*\bac-paper\b(?!-)[^'"`\n]*['"`]/.test(text)
          ? !/\bac-wind\b/.test(text)
          : false;
      });
    expect(missing).toEqual([]);
  });
});
