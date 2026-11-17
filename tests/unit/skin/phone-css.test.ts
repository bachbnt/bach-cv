/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import postcss from 'postcss';
import { describe, expect, it } from 'vitest';

const DIR = 'src/skins/phone';
const THEME = 'src/app/tailwind-theme-phone.css';
const CSS_FILES = [
  join(DIR, 'phone.css'),
  ...(existsSync(join(DIR, 'css'))
    ? readdirSync(join(DIR, 'css')).map((name) => join(DIR, 'css', name))
    : []),
];

/** What the compositor animates without a layout or a paint: nothing else may move a thing that arrives. */
const COMPOSITOR = new Set([
  'opacity',
  'translate',
  'rotate',
  'scale',
  'transform',
]);
const ARRIVALS = ['ph-rise', 'ph-fade', 'ph-pop', 'ph-drop'];

const tsxFiles = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return tsxFiles(path);
    return /\.(tsx|ts)$/.test(name) ? [path] : [];
  });

const rulesOf = (file: string) => {
  const rules: postcss.Rule[] = [];
  postcss.parse(readFileSync(file, 'utf8')).walkRules((rule) => {
    const parent = rule.parent;
    if (
      parent?.type === 'atrule' &&
      /keyframes$/.test((parent as postcss.AtRule).name)
    )
      return;
    rules.push(rule);
  });
  return rules;
};

describe('the CSS of the Phone skin', () => {
  it('keeps every hover style inside @media (hover: hover)', () => {
    const bare: string[] = [];
    for (const file of CSS_FILES)
      for (const rule of rulesOf(file)) {
        if (!rule.selector.includes(':hover')) continue;
        let inside = false;
        for (
          let node: postcss.Node | undefined = rule.parent;
          node;
          node = node.parent
        )
          if (
            node.type === 'atrule' &&
            /hover\s*:\s*hover/.test((node as postcss.AtRule).params)
          )
            inside = true;
        if (!inside) bare.push(`${file}: ${rule.selector}`);
      }
    expect(bare).toEqual([]);
  });

  it('gives every class the ph- prefix, so it cannot touch another skin', () => {
    const foreign: string[] = [];
    for (const file of CSS_FILES)
      for (const rule of rulesOf(file))
        for (const match of rule.selector.matchAll(/\.([A-Za-z_][\w-]*)/g))
          // `dark` is the class that the theme puts on <html>
          if (!match[1].startsWith('ph-') && match[1] !== 'dark')
            foreign.push(`${file}: .${match[1]}`);
    expect(foreign).toEqual([]);
  });

  it('scopes every rule to the root of the skin or to its palette on <html>', () => {
    const loose: string[] = [];
    for (const file of CSS_FILES)
      for (const rule of rulesOf(file)) {
        const parent = rule.parent;
        // the view transitions and the base layer name their own pseudo elements and classes
        if (rule.selector.includes('::view-transition')) continue;
        if (
          parent?.type === 'atrule' &&
          (parent as postcss.AtRule).name === 'media'
        ) {
          const grand = parent.parent;
          if (grand?.type === 'root') {
            /* a media query around rules: judged by the selector below */
          }
        }
        const ok = rule.selector
          .split(',')
          .every((s) => /html\[data-skin='phone'\]|\.ph-/.test(s));
        if (!ok) loose.push(`${file}: ${rule.selector}`);
      }
    expect(loose).toEqual([]);
  });

  it('never repeats the name of a keyframes rule: the last one would silently win', () => {
    const names: string[] = [];
    for (const file of CSS_FILES)
      postcss
        .parse(readFileSync(file, 'utf8'))
        .walkAtRules(/keyframes$/, (rule) => {
          names.push(rule.params);
        });
    expect(names.filter((name, i) => names.indexOf(name) !== i)).toEqual([]);
    expect(names.filter((name) => !name.startsWith('ph-'))).toEqual([]);
  });

  it('moves what arrives with the compositor only, so the layout never moves', () => {
    const found = new Map<string, Set<string>>();
    for (const file of CSS_FILES)
      postcss
        .parse(readFileSync(file, 'utf8'))
        .walkAtRules(/keyframes$/, (rule) => {
          const props = new Set<string>();
          rule.walkDecls((decl) => {
            props.add(decl.prop);
          });
          found.set(rule.params, props);
        });
    for (const name of ARRIVALS) {
      expect(found.has(name), `${name} exists`).toBe(true);
      for (const prop of found.get(name) ?? [])
        expect(COMPOSITOR.has(prop), `${name} animates ${prop}`).toBe(true);
    }
  });

  it('switches every animation off for prefers-reduced-motion', () => {
    const text = readFileSync(join(DIR, 'phone.css'), 'utf8');
    expect(text).toMatch(
      /@media \(prefers-reduced-motion: reduce\)[\s\S]*animation: none/,
    );
  });
});

describe('the motion of the Phone skin', () => {
  /** The scale of time of the skin: a press, a fade or a pop, a sheet, an app that opens or closes; the phases of the fold have their own (`css/device.css`). */
  const SCALE = new Set(['100ms', '180ms', '280ms', '360ms']);

  it('uses `!important` only to switch the motion off', () => {
    const found: string[] = [];
    for (const file of CSS_FILES)
      postcss.parse(readFileSync(file, 'utf8')).walkDecls((decl) => {
        if (!decl.important) return;
        let inside = false;
        for (
          let node: postcss.Node | undefined = decl.parent;
          node;
          node = node.parent
        )
          if (
            node.type === 'atrule' &&
            /prefers-reduced-motion/.test((node as postcss.AtRule).params)
          )
            inside = true;
        if (!inside) found.push(`${file}: ${decl.prop}`);
      });
    expect(found).toEqual([]);
  });

  it('never animates a property that moves the layout or repaints a big area', () => {
    const found: string[] = [];
    const MOVES =
      /\b(all|width|height|top|left|right|bottom|margin|padding|box-shadow|filter|backdrop-filter|border-radius|inset)\b/;
    for (const file of tsxFiles(DIR)) {
      const text = readFileSync(file, 'utf8');
      for (const m of text.matchAll(/transition-(all|\[([^\]]+)\])/g))
        if (m[1] === 'all' || MOVES.test(m[2].replace(/,/g, ' ')))
          found.push(`${file}: ${m[0]}`);
    }
    expect(found).toEqual([]);
  });

  it('takes the length of a utility transition or animation from the scale', () => {
    const found: string[] = [];
    for (const file of tsxFiles(DIR)) {
      const text = readFileSync(file, 'utf8');
      for (const m of text.matchAll(
        /\bduration-(?:\[([0-9]+ms)\]|([0-9]+))/g,
      )) {
        const length = m[1] ?? `${m[2]}ms`;
        if (!SCALE.has(length)) found.push(`${file}: ${m[0]}`);
      }
    }
    expect(found).toEqual([]);
  });

  it('takes the length of a keyframe animation or a transition of the CSS from the scale, except for the fold and the loops', () => {
    const found: string[] = [];
    for (const file of CSS_FILES) {
      // the fold has its own phases, and the loops (typing, blink, shimmer) are not a response to anything
      if (file.endsWith('device.css')) continue;
      postcss
        .parse(readFileSync(file, 'utf8'))
        .walkDecls(/^(animation|transition|animation-duration)$/, (decl) => {
          if (/infinite|none/.test(decl.value)) return;
          for (const m of decl.value.matchAll(/(?<![\w.-])([0-9.]+ms)\b/g))
            if (!SCALE.has(m[1]) && m[1] !== '600ms')
              found.push(`${file}: ${decl.prop}: ${decl.value}`);
        });
    }
    expect(found).toEqual([]);
  });
});

describe('the colours of the Phone skin as utilities', () => {
  const theme = readFileSync(THEME, 'utf8');
  const palette = readFileSync(join(DIR, 'phone.css'), 'utf8');
  const mapped = new Map(
    [
      ...theme.matchAll(/--color-(ph-[a-z0-9-]+):\s*var\(--(ph-[a-z0-9-]+)\)/g),
    ].map((m) => [m[1], m[2]]),
  );

  it('point every --color-ph-* at a --ph-* value that the palette defines, in the dark and the light theme', () => {
    const dark = postcss.parse(palette);
    const darkTokens = new Set<string>();
    const lightTokens = new Set<string>();
    dark.walkRules((rule) => {
      const target =
        rule.selector === "html[data-skin='phone']"
          ? darkTokens
          : rule.selector === "html[data-skin='phone']:not(.dark)"
            ? lightTokens
            : null;
      if (!target) return;
      rule.walkDecls(/^--ph-/, (decl) => {
        target.add(decl.prop.slice(2));
      });
    });
    const missing = [...mapped.values()].filter(
      (name) => !darkTokens.has(name),
    );
    expect(missing).toEqual([]);
    // the light theme redefines what changes with the theme: every colour that differs in meaning (ink, surfaces, glass) has a light value
    for (const name of [
      'ph-ink',
      'ph-mute',
      'ph-sheet',
      'ph-sheet-2',
      'ph-sheet-3',
      'ph-accent',
      'ph-accent-ink',
      'ph-on-accent',
      'ph-glass',
      'ph-glass-ink',
      'ph-wall-1',
    ])
      expect(lightTokens.has(name), `${name} in the light theme`).toBe(true);
  });

  it('has a theme colour for every colour utility that the skin uses (a name defined only as a variable silently makes no class)', () => {
    const used = new Set<string>();
    const UTILITY =
      /\b(?:bg|text|border|from|to|via|ring|fill|stroke|divide|outline|decoration|caret|accent|ring-offset|shadow)-(ph-[a-z0-9]+(?:-[a-z0-9]+)*)(?=[\s'"`/:\]]|$)/g;
    for (const file of tsxFiles(DIR))
      for (const m of readFileSync(file, 'utf8').matchAll(UTILITY))
        used.add(m[1]);
    // shadows are `--shadow-ph-*`, not colours
    const shadows = new Set(
      [...theme.matchAll(/--shadow-(ph-[a-z0-9-]+):/g)].map((m) => m[1]),
    );
    const missing = [...used].filter(
      (name) => !mapped.has(name) && !shadows.has(name),
    );
    expect(missing).toEqual([]);
  });

  it('keeps raw colours out of the TSX of the skin: tokens only', () => {
    const RAW = /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(|\boklch\(/g;
    const found: string[] = [];
    for (const file of tsxFiles(DIR)) {
      const text = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
      for (const m of text.matchAll(RAW)) found.push(`${file}: ${m[0]}`);
    }
    expect(found).toEqual([]);
  });
});
