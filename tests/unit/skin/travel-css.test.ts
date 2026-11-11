/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { readdirSync, readFileSync } from 'node:fs';
import postcss from 'postcss';
import { cameraTransform } from '@/skins/travel/map/camera';
import { describe, expect, it } from 'vitest';

const DIR = 'src/skins/travel';
const FILES = [
  `${DIR}/travel.css`,
  ...readdirSync(`${DIR}/css`).map((name) => `${DIR}/css/${name}`),
];

const rules = () => {
  const found: postcss.Rule[] = [];
  for (const file of FILES)
    postcss.parse(readFileSync(file, 'utf8')).walkRules((rule) => {
      const parent = rule.parent;
      if (
        parent?.type === 'atrule' &&
        /keyframes$/.test((parent as postcss.AtRule).name)
      )
        return;
      found.push(rule);
    });
  return found;
};

describe('the CSS of the Travel skin', () => {
  it('keeps every hover style inside @media (hover: hover)', () => {
    const bare = rules().filter((rule) => {
      if (!rule.selector.includes(':hover')) return false;
      for (let n: postcss.Node | undefined = rule.parent; n; n = n.parent)
        if (
          n.type === 'atrule' &&
          /hover\s*:\s*hover/.test((n as postcss.AtRule).params)
        )
          return false;
      return true;
    });
    expect(bare.map((r) => r.selector)).toEqual([]);
  });

  it('gives every class the tl- prefix, so it cannot touch another skin', () => {
    const foreign = rules().flatMap((rule) =>
      [...rule.selector.matchAll(/\.([A-Za-z_][\w-]*)/g)]
        .map((m) => m[1])
        // `dark` is the class that the theme puts on <html>
        .filter((name) => !name.startsWith('tl-') && name !== 'dark'),
    );
    expect([...new Set(foreign)]).toEqual([]);
  });

  it('names its palette with --tl-, in both themes, and gives every colour a day and a night value', () => {
    const palette = (selector: RegExp) =>
      rules()
        .filter((r) => selector.test(r.selector))
        .flatMap((r) =>
          r.nodes.filter((n): n is postcss.Declaration => n.type === 'decl'),
        )
        .map((d) => d.prop)
        .filter((p) => p.startsWith('--tl-'));
    const night = new Set(palette(/^html\[data-skin='travel'\]$/));
    const day = new Set(palette(/^html\[data-skin='travel'\]:not\(\.dark\)$/));
    for (const name of [
      '--tl-sea-1',
      '--tl-land-1',
      '--tl-coral',
      '--tl-panel',
      '--tl-ink',
      '--tl-stop-1',
    ]) {
      expect(night.has(name), name).toBe(true);
      expect(day.has(name), name).toBe(true);
    }
  });

  it('defines every theme colour the utilities use', () => {
    const theme = readFileSync('src/app/tailwind-theme-travel.css', 'utf8');
    const css = readFileSync(`${DIR}/travel.css`, 'utf8');
    const used = [...theme.matchAll(/var\((--tl-[\w-]+)\)/g)]
      .map((m) => m[1])
      .filter((v) => v !== '--tl-shadow');
    for (const name of used) expect(css, name).toContain(`${name}:`);
  });

  it('turns every motion off for reduced motion', () => {
    const css = readFileSync(`${DIR}/travel.css`, 'utf8');
    expect(css).toMatch(
      /prefers-reduced-motion: reduce\)[\s\S]*animation: none !important/,
    );
  });

  it('animates only what the compositor moves, so the idle map does not make the main thread draw a frame at every refresh', () => {
    // transform, opacity and the individual transform properties; a box-shadow, a margin, an offset or a stroke offset is repainted by
    // the main thread at every frame
    const ok = new Set([
      'transform',
      'opacity',
      'translate',
      'scale',
      'rotate',
    ]);
    const heavy: string[] = [];
    for (const file of FILES)
      postcss
        .parse(readFileSync(file, 'utf8'))
        .walkAtRules(/keyframes$/, (frames) => {
          frames.walkDecls((decl) => {
            if (!ok.has(decl.prop))
              heavy.push(`${frames.params}: ${decl.prop}`);
          });
        });
    // the only one left is the falling water, which runs only when the map is zoomed in (`.tl-close`)
    expect(heavy).toEqual(['tl-fall: stroke-dashoffset']);
    const loose = rules().filter(
      (rule) =>
        /(^|[\s,])\.tl-fall(\s|,|$)/.test(rule.selector) &&
        !rule.selector.includes('.tl-close') &&
        // a rule that stops it (`animation: none`, for what is far from the screen or the whole map) is not one that starts it
        rule.nodes.some(
          (n) =>
            n.type === 'decl' && n.prop === 'animation' && n.value !== 'none',
        ),
    );
    expect(loose.map((r) => r.selector)).toEqual([]);
  });

  it('keeps the world off a layer of its own at rest and the shore off one at every zoom on a phone, which killed the tab of an iPhone', () => {
    // the world is 6678 by 3998 units: `translate3d` puts all of it on a layer, a paused animation keeps the shore on one
    expect(
      cameraTransform({ cx: 100, cy: 100, z: 1 }, { w: 400, h: 800 }),
    ).not.toMatch(/3d/);
    const stopped = rules().filter(
      (rule) =>
        rule.selector.includes('.tl-shore') &&
        rule.nodes.some(
          (n) =>
            n.type === 'decl' && n.prop === 'animation' && n.value === 'none',
        ),
    );
    // once when the whole map is on screen, once on a touch screen
    expect(stopped).toHaveLength(2);
  });

  it('imports every CSS file of the folder, with still.css after the files whose loops it stops (at equal specificity the later rule wins)', () => {
    const imported = [
      ...readFileSync(`${DIR}/skin.tsx`, 'utf8').matchAll(
        /import '@\/skins\/travel\/css\/([\w-]+\.css)';/g,
      ),
    ].map((m) => m[1]);
    expect([...imported].sort()).toEqual(
      readdirSync(`${DIR}/css`)
        .filter((name) => name.endsWith('.css'))
        .sort(),
    );
    const at = (name: string) => imported.indexOf(name);
    // the touch-screen rules set `animation: none` on the clouds, birds, stars and foam of sky.css and ground.css
    for (const earlier of ['sky.css', 'ground.css', 'sights.css'])
      expect(at('still.css'), earlier).toBeGreaterThan(at(earlier));
    // the pins are sprites too: `.tl-sprite > *` of sights.css comes first, `.tl-pin > *` and `.tl-pin-flag` of pins.css override it
    expect(at('pins.css')).toBeGreaterThan(at('sights.css'));
    expect(at('tags.css')).toBeGreaterThan(at('sights.css'));
  });

  it('keeps the state classes of the map for ancestors only, so no other rule can style the map itself through them', () => {
    // a state class that is also a drawing class resized the whole map once (`tl-far` is the far mountains of the sky)
    const states = ['tl-paused', 'tl-moving', 'tl-close', 'tl-whole'];
    const styled = rules().flatMap((rule) =>
      rule.selector
        .split(',')
        .map((part) => part.trim().split(/\s+/).pop() ?? '')
        .filter((last) => states.some((name) => last.includes(`.${name}`)))
        .map(() => rule.selector),
    );
    expect(styled).toEqual([]);
  });

  it('stops every loop that runs on the map when the whole map is on screen, but those that are not on it or already off', () => {
    // the sky is outside the map's own layer, the waves are not drawn then and the falling water runs only zoomed in
    const exempt = ['tl-cloud', 'tl-bird', 'tl-stars', 'tl-wave', 'tl-fall'];
    const looping = new Set<string>();
    for (const rule of rules()) {
      const animates = rule.nodes.some(
        (n) =>
          n.type === 'decl' &&
          n.prop === 'animation' &&
          /infinite/.test(n.value),
      );
      if (!animates) continue;
      for (const [, name] of rule.selector.matchAll(/\.(tl-[\w-]+)/g))
        if (!/^tl-(close|whole|moving)$/.test(name)) looping.add(name);
    }
    const stopped = rules()
      .filter((r) => r.selector.startsWith('.tl-whole'))
      .flatMap((r) =>
        [...r.selector.matchAll(/\.(tl-[\w-]+)/g)].map((m) => m[1]),
      );
    const left = [...looping].filter(
      (name) =>
        !exempt.includes(name) &&
        !stopped.includes(name) &&
        // a modifier of a looping class (a delay) is covered by the class it modifies
        !/-\d$/.test(name) &&
        // the dot that walks while the BB Bot answers is in its card, not on the map, and runs only during the wait
        !/^tl-(live|spin|rise|stamp|dive-bob|guide-walk)/.test(name),
    );
    expect(left).toEqual([]);
  });

  it('never changes the cursor of the map while it is moved: it is inherited, so the browser would restyle all its elements at the first step', () => {
    const changing = rules().filter(
      (rule) =>
        /\.tl-map/.test(rule.selector) &&
        /(\.tl-(dragging|moving|whole|close)|:active)/.test(rule.selector) &&
        rule.nodes.some((n) => n.type === 'decl' && n.prop === 'cursor'),
    );
    expect(changing.map((r) => r.selector)).toEqual([]);
    // the two big subtrees say their own cursor, so that what they hold does not depend on the one of the map
    const own = rules().filter(
      (rule) =>
        /\.tl-map\s*>\s*\.tl-(view|sky)/.test(rule.selector) &&
        rule.nodes.some((n) => n.type === 'decl' && n.prop === 'cursor'),
    );
    expect(own.length).toBeGreaterThan(0);
  });
});
