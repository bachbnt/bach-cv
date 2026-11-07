/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const SKIN = 'src/skins/trade';
const SHELL_FILES = [
  ...readdirSync(`${SKIN}/shell`).map((name) => `${SKIN}/shell/${name}`),
  ...readdirSync(`${SKIN}/blocks`)
    .filter((name) => name.startsWith('shell-') || name.startsWith('home-'))
    .map((name) => `${SKIN}/blocks/${name}`),
  `${SKIN}/pages/home.tsx`,
  `${SKIN}/ui/shell-widget.tsx`,
].filter((file) => /\.tsx?$/.test(file));

const keyframesDefined = () => {
  const css = [
    `${SKIN}/trade.css`,
    ...readdirSync(`${SKIN}/css`).map((n) => `${SKIN}/css/${n}`),
  ]
    .map((file) => readFileSync(file, 'utf8'))
    .join('\n');
  return new Set([...css.matchAll(/@keyframes\s+([\w-]+)/g)].map((m) => m[1]));
};

describe('the animations of the terminal frame and Home', () => {
  it('only name keyframes that exist, so none of them silently does nothing', () => {
    const defined = keyframesDefined();
    const used = SHELL_FILES.flatMap((file) =>
      [...readFileSync(file, 'utf8').matchAll(/animate-\[(tv-[a-z-]+)_/g)].map(
        (m) => m[1],
      ),
    );
    expect(used.length).toBeGreaterThan(0);
    expect(used.filter((name) => !defined.has(name))).toEqual([]);
  });

  it('keeps its keyframes to transform and opacity', () => {
    const css = readFileSync(`${SKIN}/css/shell.css`, 'utf8');
    const props = [...css.matchAll(/^\s+([a-z-]+):/gm)].map((m) => m[1]);
    expect(props.length).toBeGreaterThan(0);
    expect(props.filter((p) => !['transform', 'opacity'].includes(p))).toEqual(
      [],
    );
  });

  it('writes no hex colour and no fetch in its components', () => {
    for (const file of SHELL_FILES) {
      const text = readFileSync(file, 'utf8');
      expect(text, file).not.toMatch(/#[0-9a-fA-F]{3,8}\b(?!['"]?\s*[,:])/);
      // the QR window saves the picture the way Standard does (a fetch of the image, with a new tab when the browser refuses)
      if (!file.endsWith('overlay-qr-dialog.tsx'))
        expect(text, file).not.toMatch(/\bfetch\(/);
    }
  });
});
