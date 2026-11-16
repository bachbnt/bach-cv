/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { TILE_GLYPHS, TILE_GRADIENTS } from '@/skins/phone/config';
import { PhIconTile } from '@/skins/phone/ui/ph-icon-tile';

const NAMES = Object.keys(TILE_GRADIENTS) as (keyof typeof TILE_GRADIENTS)[];
const RAW = /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(|\boklch\(/;

const glyph = (name: (typeof NAMES)[number]) =>
  renderToStaticMarkup(createElement(TILE_GLYPHS[name]));

describe('the glyphs of the app icons of the Phone skin', () => {
  it('has a glyph for every tile', () => {
    expect(NAMES).toHaveLength(11);
    for (const name of NAMES)
      expect(typeof TILE_GLYPHS[name], `${name} glyph`).toBe('function');
  });

  it('draws every glyph on a 48 x 48 box, hidden from readers, with tokens only', () => {
    for (const name of NAMES) {
      const html = glyph(name);
      expect(html, name).toMatch(/^<svg /);
      expect(html, name).toContain('viewBox="0 0 48 48"');
      expect(html, name).toContain('aria-hidden="true"');
      expect(html, name).not.toMatch(RAW);
      // the white of the glyph is the token, and every other tone is a token too
      expect(html, name).toContain('ph-on-tile');
      for (const m of html.matchAll(/class="([^"]*)"/g))
        for (const c of m[1]
          .split(' ')
          .filter((c) => /^(fill|stroke)-/.test(c)))
          expect(c, `${name} ${c}`).toMatch(/^(fill|stroke)-ph-/);
    }
  });

  it('keeps the drawing in two tones: white and one detail', () => {
    for (const name of NAMES) {
      const tones = new Set(
        [
          ...glyph(name).matchAll(
            /(?:^|[\s"])(?:fill|stroke)-(ph-[a-z0-9-]+(?:\/\d+)?)/g,
          ),
        ]
          .map((m) => m[1])
          // the stroke that rounds a white shape is the same tone as its fill
          .filter((tone) => tone !== 'ph-on-tile'),
      );
      expect(
        tones.size,
        `${name}: ${[...tones].join(', ')}`,
      ).toBeLessThanOrEqual(2);
    }
  });

  it('keeps every stroke in the box at 3 units or more', () => {
    for (const name of NAMES)
      for (const m of glyph(name).matchAll(/stroke-width="([\d.]+)"/g))
        expect(Number(m[1]), `${name} stroke`).toBeGreaterThanOrEqual(3);
  });

  it('hides the whole tile from readers and gives it the gradient of its page', () => {
    for (const name of NAMES) {
      const html = renderToStaticMarkup(
        createElement(PhIconTile, { tile: name }),
      );
      expect(html, name).toMatch(/^<span aria-hidden="true"/);
      expect(html, name).toContain(`from-ph-tile-${name}-a`);
      expect(html, name).not.toMatch(RAW);
    }
  });
});
