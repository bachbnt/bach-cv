/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { readFileSync } from 'node:fs';
import postcss from 'postcss';
import { describe, expect, it } from 'vitest';

const FILES = [
  'src/skins/trade/trade.css',
  'src/skins/trade/css/chart.css',
  'src/skins/trade/css/data.css',
];

type Rgba = [number, number, number, number];

/** The `--name: value` declarations of the rules for `html[data-skin='trade']`, dark (the base) and light (`:not(.dark)` on top). */
const palette = (): {
  dark: Record<string, string>;
  light: Record<string, string>;
} => {
  const dark: Record<string, string> = {};
  const light: Record<string, string> = {};
  for (const file of FILES)
    postcss.parse(readFileSync(file, 'utf8')).walkRules((rule) => {
      const target =
        rule.selector === "html[data-skin='trade']"
          ? dark
          : rule.selector === "html[data-skin='trade']:not(.dark)"
            ? light
            : null;
      if (!target) return;
      rule.walkDecls(/^--/, (decl) => {
        // prettier may break a long color-mix over lines
        target[decl.prop] = decl.value
          .replace(/\s+/g, ' ')
          .replace(/\( /g, '(')
          .replace(/ \)/g, ')')
          .trim();
      });
    });
  return { dark, light: { ...dark, ...light } };
};

const hexRgba = (value: string): Rgba => {
  const h = value.slice(1);
  const full = h.length === 3 ? [...h].map((c) => c + c).join('') : h;
  const n = (i: number) => parseInt(full.slice(i, i + 2), 16);
  return [n(0), n(2), n(4), full.length >= 8 ? n(6) / 255 : 1];
};

/** A colour of the palette as red, green, blue and alpha: a hex, `var(--x)`, or a `color-mix(in srgb, a p%, b)` of those. */
const resolve = (value: string, tokens: Record<string, string>): Rgba => {
  const v = value.trim();
  if (v.startsWith('#')) return hexRgba(v);
  const ref = v.match(/^var\((--[\w-]+)\)$/);
  if (ref) return resolve(tokens[ref[1]], tokens);
  const mix = v.match(/^color-mix\(in srgb, (.+) (\d+)%, (.+)\)$/);
  if (mix) {
    const p = Number(mix[2]) / 100;
    const a = resolve(mix[1], tokens);
    const b = resolve(mix[3], tokens);
    return [0, 1, 2, 3].map((i) => a[i] * p + b[i] * (1 - p)) as Rgba;
  }
  throw new Error(`cannot read the colour ${value}`);
};

/** `top` laid over `under` (alpha compositing). */
const over = (top: Rgba, under: Rgba): Rgba => {
  const a = top[3];
  return [
    top[0] * a + under[0] * (1 - a),
    top[1] * a + under[1] * (1 - a),
    top[2] * a + under[2] * (1 - a),
    1,
  ];
};

const luminance = ([r, g, b]: Rgba): number => {
  const [lr, lg, lb] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
};
const contrast = (a: Rgba, b: Rgba): number => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const WHITE: Rgba = [255, 255, 255, 1];
const { dark, light } = palette();

describe.each([
  ['dark', dark],
  ['light', light],
] as const)('Trade skin contrast, %s theme', (name, t) => {
  const c = (token: string): Rgba => resolve(t[token], t);
  const bg = c('--tv-bg');
  const panel = c('--tv-panel');
  const hover = c('--tv-hover');

  // AA for text is 4.5:1: the colours that are TEXT on the page and on a panel
  const TEXT = [
    '--tv-ink',
    '--tv-mute',
    '--tv-dim',
    '--tv-accent-ink',
    '--tv-up-ink',
    '--tv-down-ink',
    '--tv-gold-ink',
    '--tv-sky-ink',
    '--tv-orange-ink',
    '--tv-violet-ink',
    '--tv-ind-lime-ink',
    '--tv-ind-pink-ink',
    '--tv-ind-teal-ink',
    '--tv-ind-slate-ink',
  ];
  it.each(TEXT)(
    '%s is readable text on the background and on a panel (4.5:1)',
    (token) => {
      expect(
        contrast(c(token), bg),
        `${name}: ${token} on bg`,
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        contrast(c(token), panel),
        `${name}: ${token} on panel`,
      ).toBeGreaterThanOrEqual(4.5);
    },
  );

  it('ink and mute text stay readable on a hovered row (4.5:1)', () => {
    expect(contrast(c('--tv-ink'), hover)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(c('--tv-mute'), hover)).toBeGreaterThanOrEqual(4.5);
  });

  // a chip is the ink colour on a tint of itself laid over the panel (`bg-tv-gold/15` and the up and down tints)
  const CHIPS: [string, string, number][] = [
    ['--tv-up-ink', '--tv-up-bg', 1],
    ['--tv-down-ink', '--tv-down-bg', 1],
    ['--tv-gold-ink', '--tv-gold', 0.15],
    ['--tv-sky-ink', '--tv-sky', 0.15],
    ['--tv-violet-ink', '--tv-violet', 0.2],
    ['--tv-accent-ink', '--tv-accent', 0.15],
  ];
  it.each(CHIPS)(
    '%s on its chip (%s at %s) is readable (4.5:1)',
    (ink, tint, alpha) => {
      const base = c(tint);
      const wash = over([base[0], base[1], base[2], base[3] * alpha], panel);
      expect(
        contrast(c(ink), wash),
        `${name}: ${ink} on ${tint}`,
      ).toBeGreaterThanOrEqual(4.5);
    },
  );

  it('white text on the fills that carry it is at least 4.5:1', () => {
    for (const fill of [
      '--tv-accent',
      '--tv-accent-hover',
      '--tv-up-solid',
      '--tv-down-solid',
      '--tv-tip',
    ])
      expect(
        contrast(WHITE, c(fill)),
        `${name}: white on ${fill}`,
      ).toBeGreaterThanOrEqual(4.5);
  });

  it('the glyph on a violet degree flag is at least 3:1', () => {
    expect(contrast(WHITE, c('--tv-violet'))).toBeGreaterThanOrEqual(3);
  });

  it('the focus ring shows against the background, a panel and a hovered row (3:1)', () => {
    for (const surface of [bg, panel, hover])
      expect(contrast(c('--tv-accent-ink'), surface)).toBeGreaterThanOrEqual(3);
  });

  it('the night panels keep their light text', () => {
    expect(contrast(WHITE, c('--tv-night'))).toBeGreaterThanOrEqual(4.5);
  });
});
