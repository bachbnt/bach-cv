/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { NEUTRAL_THEME, PAGE_META } from '@/lib/pages';

const css = readFileSync('src/app/globals.css', 'utf8');

/** The `--name: #hex;` declarations of the rule whose selector starts with `selector`. */
const tokens = (selector: string): Record<string, string> => {
  const start = css.indexOf(`${selector} {`);
  if (start < 0) throw new Error(`no rule for ${selector}`);
  const body = css.slice(css.indexOf('{', start) + 1, css.indexOf('}', start));
  return Object.fromEntries(
    [...body.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)].map((m) => [
      m[1],
      m[2],
    ]),
  );
};

const rgb = (hex: string): [number, number, number] => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
];
const hex = (c: number[]): string =>
  `#${c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`;
const luminance = (color: string): number => {
  const [r, g, b] = rgb(color).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a: string, b: string): number => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
/** color-mix(in srgb, a p%, b) */
const mix = (a: string, p: number, b: string): string =>
  hex(rgb(a).map((v, i) => v * p + rgb(b)[i] * (1 - p)));

const light = tokens(':root,\n.theme-light');
const dark = { ...light, ...tokens('.dark') };

const themes = { light, dark } as const;

describe.each(Object.entries(themes))('%s theme contrast', (name, t) => {
  // text on its usual surface: WCAG AA for body text is 4.5
  const pairs: [string, string, string][] = [
    ['foreground', 'background', 'page text'],
    ['foreground', 'card', 'text on a card'],
    ['body', 'background', 'body copy'],
    ['body', 'card', 'body copy on a card'],
    ['muted-foreground', 'background', 'muted text'],
    ['muted-foreground', 'card', 'muted text on a card'],
    ['primary-foreground', 'primary', 'filled button'],
    ['foreground', 'secondary', 'text on a chip'],
    ['danger', 'danger-bg', 'error note'],
    ['mobile-foreground', 'mobile', 'Mobile tag'],
    ['web-foreground', 'web', 'Web tag'],
    ['ai-foreground', 'ai', 'AI tag'],
    ['tools-foreground', 'tools', 'Tools tag'],
    ['brand-ink', 'background', 'red text or link'],
    ['brand-ink', 'card', 'red text on a card'],
  ];
  it.each(pairs)('%s on %s (%s) is at least 4.5:1', (fg, bg) => {
    expect(
      contrast(t[fg], t[bg]),
      `${name}: ${fg} on ${bg}`,
    ).toBeGreaterThanOrEqual(4.5);
  });

  it('light text on the night panels and on the red button is at least 4.5:1', () => {
    expect(contrast('#ffffff', t.night)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(t['night-foreground'], t.night)).toBeGreaterThanOrEqual(
      4.5,
    );
    expect(contrast('#ffffff', t.brand)).toBeGreaterThanOrEqual(4.5);
  });

  it('borders and the focus ring show against the page and the cards (3:1)', () => {
    expect(contrast(t.ring, t.background)).toBeGreaterThanOrEqual(3);
    expect(contrast(t.ring, t.card)).toBeGreaterThanOrEqual(3);
    expect(contrast(t.input, t.card)).toBeGreaterThanOrEqual(1.3);
  });
});

describe('the page colour of every page', () => {
  const accents = [
    ...Object.entries(PAGE_META).map(([key, m]) => [key, m.accent] as const),
    ['neutral', NEUTRAL_THEME.accent] as const,
  ];
  // globals.css: light uses the accent as it is; dark lightens it and washes the tint into the page background
  it.each(accents)(
    '%s: accent text, tint and the filled chip read well in light',
    (_k, accent) => {
      const tint =
        Object.values(PAGE_META).find((m) => m.accent === accent)?.tint ??
        NEUTRAL_THEME.tint;
      expect(contrast(accent, light.background)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(light.foreground, tint)).toBeGreaterThanOrEqual(4.5);
      // text-background on bg-page (the selected filter chip)
      expect(contrast(light.background, accent)).toBeGreaterThanOrEqual(4.5);
    },
  );
  it.each(accents)(
    '%s: accent text, tint and the filled chip read well in dark',
    (_k, accent) => {
      const page = mix(accent, 0.52, '#ffffff');
      const tint = mix(accent, 0.22, dark.background);
      expect(contrast(page, dark.background)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(page, tint)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(dark.foreground, tint)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(dark['muted-foreground'], tint)).toBeGreaterThanOrEqual(
        4.5,
      );
      expect(contrast(dark.background, page)).toBeGreaterThanOrEqual(4.5);
    },
  );
});
