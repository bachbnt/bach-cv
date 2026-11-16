/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { readFileSync } from 'node:fs';
import postcss from 'postcss';
import { describe, expect, it } from 'vitest';

const FILE = 'src/skins/phone/phone.css';
const BASE = "html[data-skin='phone']";

type Rgb = [number, number, number];
type Tokens = Record<string, string>;

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

/** A colour of the palette: a hex, or a `var()` of one; `rgba(r, g, b, a)` is mixed over `under`. */
const resolve = (value: string, tokens: Tokens, under: Rgb): Rgb => {
  const v = value.trim();
  if (v.startsWith('#')) return hex(v);
  const ref = v.match(/^var\((--[\w-]+)\)$/);
  if (ref) return resolve(tokens[ref[1]], tokens, under);
  const rgba = v.match(/^rgba\((\d+), (\d+), (\d+), ([\d.]+)\)$/);
  if (rgba) {
    const a = Number(rgba[4]);
    return [0, 1, 2].map(
      (i) => Number(rgba[i + 1]) * a + under[i] * (1 - a),
    ) as Rgb;
  }
  throw new Error(`cannot read the colour ${value}`);
};

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

const mix = (a: Rgb, b: Rgb, t: number): Rgb =>
  [0, 1, 2].map((i) => a[i] * t + b[i] * (1 - t)) as Rgb;

const dark = declarations(BASE);
const light = { ...dark, ...declarations(`${BASE}:not(.dark)`) };
const NONE: Rgb = [0, 0, 0];

describe('the palette of the Phone skin keeps its text readable (4.5:1)', () => {
  for (const [name, tokens] of [
    ['dark', dark],
    ['light', light],
  ] as const) {
    it(`writes on the surfaces of an app in the ${name} theme`, () => {
      for (const surface of ['--ph-sheet', '--ph-sheet-2', '--ph-sheet-3']) {
        const bg = resolve(tokens[surface], tokens, NONE);
        for (const key of [
          '--ph-ink',
          '--ph-mute',
          '--ph-accent-ink',
          '--ph-ok',
          '--ph-warn',
          '--ph-danger',
        ])
          expect(
            ratio(resolve(tokens[key], tokens, bg), bg),
            `${key} on ${surface}`,
          ).toBeGreaterThanOrEqual(4.5);
      }
    });

    it(`puts the text of a button on its fill in the ${name} theme`, () => {
      const accent = resolve(tokens['--ph-accent'], tokens, NONE);
      expect(
        ratio(resolve(tokens['--ph-on-accent'], tokens, accent), accent),
      ).toBeGreaterThanOrEqual(4.5);
    });

    it(`reads a chip (the accent at 15% on the surface) in the ${name} theme`, () => {
      for (const surface of ['--ph-sheet', '--ph-sheet-2']) {
        const bg = resolve(tokens[surface], tokens, NONE);
        const accent = resolve(tokens['--ph-accent'], tokens, NONE);
        const chip = mix(accent, bg, 0.15);
        for (const key of ['--ph-accent-ink', '--ph-ok', '--ph-warn'])
          expect(
            ratio(resolve(tokens[key], tokens, chip), chip),
            `${key} on a chip over ${surface}`,
          ).toBeGreaterThanOrEqual(4.5);
      }
    });

    it(`keeps the text on the wallpaper readable in the ${name} theme`, () => {
      // the wallpaper is a base colour with three lights, the brightest spot of each being the light itself, and a glass card lies over it
      const spots = [
        '--ph-wall-base',
        '--ph-wall-1',
        '--ph-wall-2',
        '--ph-wall-3',
      ].map((k) => resolve(tokens[k], tokens, NONE));
      for (const spot of spots) {
        const glass = resolve(tokens['--ph-glass'], tokens, spot);
        for (const key of ['--ph-glass-ink']) {
          const ink = resolve(tokens[key], tokens, glass);
          expect(
            ratio(ink, spot),
            `${key} on the wallpaper`,
          ).toBeGreaterThanOrEqual(4.5);
          expect(
            ratio(ink, glass),
            `${key} on glass over the wallpaper`,
          ).toBeGreaterThanOrEqual(4.5);
        }
      }
    });
  }
});

/** What the veil of the system chrome is made of, and the surfaces that can lie under it. */
const SURFACES = ['--ph-sheet', '--ph-sheet-2', '--ph-sheet-3'];
const SPOTS = ['--ph-wall-base', '--ph-wall-1', '--ph-wall-2', '--ph-wall-3'];
/** `ink` painted at `opacity` over `under`. */
const faded = (ink: Rgb, under: Rgb, opacity: number): Rgb =>
  mix(ink, under, opacity);

describe('the chrome of the Phone skin keeps its text readable (4.5:1)', () => {
  for (const [name, tokens] of [
    ['dark', dark],
    ['light', light],
  ] as const) {
    const color = (key: string, under: Rgb = NONE) =>
      resolve(tokens[key], tokens, under);

    it(`reads the app bar, a veil of the sheet from 75% to 25% over any surface, in the ${name} theme`, () => {
      // the title and the buttons sit in the middle of the bar, where the veil is 45%; the foot of the bar is 25%
      for (const alpha of [0.75, 0.45, 0.25])
        for (const under of SURFACES) {
          const ground = mix(color('--ph-sheet'), color(under), alpha);
          for (const key of ['--ph-ink', '--ph-accent-ink'])
            expect(
              ratio(color(key, ground), ground),
              `${key} on the bar (${alpha}) over ${under}`,
            ).toBeGreaterThanOrEqual(4.5);
        }
    });

    it(`reads the clock on the strip of the status bar, over an app and over the wallpaper, in the ${name} theme`, () => {
      for (const under of SURFACES) {
        const ground = mix(color('--ph-sheet'), color(under), 0.8);
        const ink = color('--ph-ink', ground);
        expect(
          ratio(ink, ground),
          `clock over ${under}`,
        ).toBeGreaterThanOrEqual(4.5);
        // the name of the system next to it is the same ink at 70%
        expect(
          ratio(faded(ink, ground, 0.7), ground),
          `name of the system over ${under}`,
        ).toBeGreaterThanOrEqual(4.5);
      }
      for (const spot of SPOTS) {
        const ground = mix(color('--ph-wall-base'), color(spot), 0.65);
        const ink = color('--ph-glass-ink', ground);
        expect(ratio(ink, ground), `clock over ${spot}`).toBeGreaterThanOrEqual(
          4.5,
        );
        expect(
          ratio(faded(ink, ground, 0.7), ground),
          `name of the system over ${spot}`,
        ).toBeGreaterThanOrEqual(4.5);
      }
    });

    it(`keeps the battery glyphs (the red of the danger, the green of the charger) at 3:1 on the strip, over an app and over the wallpaper, in the ${name} theme`, () => {
      const grounds = [
        ...SURFACES.map((under) => mix(color('--ph-sheet'), color(under), 0.8)),
        ...SPOTS.map((spot) => mix(color('--ph-wall-base'), color(spot), 0.65)),
      ];
      for (const ground of grounds)
        for (const key of ['--ph-danger', '--ph-ok', '--ph-ink'])
          expect(
            ratio(color(key, ground), ground),
            `${key} on the strip`,
          ).toBeGreaterThanOrEqual(3);
      // the glass ink of the home screen is the ink of the glyphs over the wallpaper, and the bolt (the sheet colour) lies over the green
      for (const spot of SPOTS) {
        const ground = mix(color('--ph-wall-base'), color(spot), 0.65);
        expect(
          ratio(color('--ph-glass-ink', ground), ground),
          `glass ink over ${spot}`,
        ).toBeGreaterThanOrEqual(3);
      }
      expect(
        ratio(color('--ph-sheet'), color('--ph-ok')),
        'the bolt on the fill',
      ).toBeGreaterThanOrEqual(3);
    });

    it(`reads the tooltip (the sheet colour on the ink), the badge of the toast and the error notes in the ${name} theme`, () => {
      const ink = color('--ph-ink');
      expect(ratio(color('--ph-sheet'), ink)).toBeGreaterThanOrEqual(4.5);
      const ok = color('--ph-ok');
      expect(ratio(color('--ph-sheet'), ok)).toBeGreaterThanOrEqual(4.5);
      // the error bubble of the chat and the note of the CV: the danger colour on itself at 10% over the sheet
      for (const surface of SURFACES) {
        const bg = mix(color('--ph-danger'), color(surface), 0.1);
        expect(
          ratio(color('--ph-danger', bg), bg),
          `danger over ${surface}`,
        ).toBeGreaterThanOrEqual(4.5);
      }
    });

    it(`reads a chip on the third surface and a plain chip in the ${name} theme`, () => {
      const bg = color('--ph-sheet-3');
      const chip = mix(color('--ph-accent'), bg, 0.15);
      for (const key of ['--ph-accent-ink', '--ph-ok', '--ph-warn'])
        expect(
          ratio(color(key, chip), chip),
          `${key} on a chip over the third surface`,
        ).toBeGreaterThanOrEqual(4.5);
    });
  }
});

describe('the glyph of an icon tile is a graphical object: 3:1 against both ends of its gradient', () => {
  const TILES = [
    'home',
    'about',
    'resume',
    'projects',
    'certificates',
    'services',
    'payment',
    'settings',
    'chat',
    'connect',
    'cv',
  ];
  for (const [name, tokens] of [
    ['dark', dark],
    ['light', light],
  ] as const)
    it(`holds in the ${name} theme, with the top stop lighter than the bottom one`, () => {
      const glyph = resolve(tokens['--ph-on-tile'], tokens, NONE);
      for (const tile of TILES) {
        const top = resolve(tokens[`--ph-tile-${tile}-a`], tokens, NONE);
        const bottom = resolve(tokens[`--ph-tile-${tile}-b`], tokens, NONE);
        expect(ratio(glyph, top), `${tile}, top`).toBeGreaterThanOrEqual(3);
        expect(ratio(glyph, bottom), `${tile}, bottom`).toBeGreaterThanOrEqual(
          3,
        );
        expect(luminance(top), `${tile} is lighter at the top`).toBeGreaterThan(
          luminance(bottom),
        );
      }
    });
});

describe('the chips of a skill keep their text readable (4.5:1) in every hue', () => {
  for (const [name, tokens] of [
    ['dark', dark],
    ['light', light],
  ] as const) {
    it(`reads the text on the tint, over every surface a chip can be on, in the ${name} theme`, () => {
      const hues = Object.keys(tokens)
        .filter((key) => /^--ph-tag-[a-z]+-bg$/.test(key))
        .map((key) => key.slice('--ph-tag-'.length, -'-bg'.length));
      expect(hues.length).toBeGreaterThanOrEqual(4);
      for (const surface of SURFACES) {
        const under = resolve(tokens[surface], tokens, NONE);
        for (const hue of hues) {
          const fill = resolve(tokens[`--ph-tag-${hue}-bg`], tokens, under);
          const ink = resolve(tokens[`--ph-tag-${hue}-ink`], tokens, fill);
          expect(
            ratio(ink, fill),
            `${hue} on ${surface}`,
          ).toBeGreaterThanOrEqual(4.5);
        }
      }
    });
  }
});
