/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { readFileSync } from 'node:fs';
import postcss from 'postcss';
import { describe, expect, it } from 'vitest';

const FILE = 'src/skins/academic/academic.css';
const BASE = "html[data-skin='academic']";

type Rgb = [number, number, number];
type Tokens = Record<string, string>;

/** The `--name: value` declarations of one selector of the palette. */
const declarations = (selector: string): Tokens => {
  const out: Tokens = {};
  postcss.parse(readFileSync(FILE, 'utf8')).walkRules((rule) => {
    if (rule.selector !== selector) return;
    rule.walkDecls(/^--/, (decl) => {
      out[decl.prop] = decl.value.replace(/\s+/g, ' ').trim();
    });
  });
  return out;
};

const hex = (value: string): Rgb => {
  const h = value.slice(1);
  const n = (i: number) => parseInt(h.slice(i, i + 2), 16);
  return [n(0), n(2), n(4)];
};

/** A colour of the palette: a hex, or a `var()` of one. */
const resolve = (value: string, tokens: Tokens): Rgb => {
  const v = value.trim();
  if (v.startsWith('#')) return hex(v);
  const ref = v.match(/^var\((--[\w-]+)\)$/);
  if (ref) return resolve(tokens[ref[1]], tokens);
  throw new Error(`cannot read the colour ${value}`);
};

const mix = (a: Rgb, b: Rgb, t: number): Rgb =>
  [0, 1, 2].map((i) => a[i] * t + b[i] * (1 - t)) as Rgb;

const luminance = ([r, g, b]: Rgb): number => {
  const f = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};

const ratio = (a: Rgb, b: Rgb): number => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const dark = declarations(BASE);
const light = { ...dark, ...declarations(`${BASE}:not(.dark)`) };
const paperVars = declarations('.ac-paper');

describe('the palette of the Academic skin keeps its text readable (4.5:1)', () => {
  for (const [name, tokens] of [
    ['chalkboard', dark],
    ['whiteboard', light],
  ] as const) {
    it(`writes on the ${name} in colours that read on the board and on its panel`, () => {
      // the board is lit from the top left: the brightest part is a little lighter than its colour
      const board = resolve(tokens['--ac-board'], tokens);
      const lit =
        name === 'chalkboard' ? mix([255, 255, 255], board, 0.12) : board;
      const panel = resolve(tokens['--ac-panel'], tokens);
      for (const key of [
        '--ac-ink',
        '--ac-mute',
        '--ac-accent',
        '--ac-link',
        '--ac-ma',
        '--ac-mb',
        '--ac-mc',
        '--ac-md',
      ]) {
        const ink = resolve(tokens[key], tokens);
        expect(
          ratio(ink, lit),
          `${key} on the lit board`,
        ).toBeGreaterThanOrEqual(4.5);
        expect(ratio(ink, panel), `${key} on the panel`).toBeGreaterThanOrEqual(
          4.5,
        );
      }
    });

    it(`writes on paper pinned to the ${name} in ink that reads on both ends of the sheet`, () => {
      const tokens2 = { ...tokens, ...paperVars };
      const sheet = resolve(tokens['--ac-sheet'], tokens);
      // the sheet is shaded towards one corner: `color-mix(in srgb, sheet 90%, --ac-paper-shade)`
      const shaded = mix(
        sheet,
        resolve(tokens['--ac-paper-shade'], tokens),
        0.9,
      );
      for (const key of [
        '--ac-ink',
        '--ac-mute',
        '--ac-accent',
        '--ac-link',
        '--ac-ma',
        '--ac-mb',
        '--ac-mc',
        '--ac-md',
      ]) {
        const ink = resolve(tokens2[key], tokens2);
        expect(ratio(ink, sheet), `${key} on the sheet`).toBeGreaterThanOrEqual(
          4.5,
        );
        expect(
          ratio(ink, shaded),
          `${key} on the shaded sheet`,
        ).toBeGreaterThanOrEqual(4.5);
      }
    });
  }
});
