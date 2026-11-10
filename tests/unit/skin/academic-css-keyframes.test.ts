/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { readdirSync, readFileSync } from 'node:fs';
import postcss from 'postcss';
import { describe, expect, it } from 'vitest';

const DIR = 'src/skins/academic';
const CSS_FILES = [
  `${DIR}/academic.css`,
  ...readdirSync(`${DIR}/css`).map((name) => `${DIR}/css/${name}`),
];
/** What the compositor animates without a layout or a paint: nothing else may move a thing that arrives. */
const COMPOSITOR = new Set([
  'opacity',
  'translate',
  'rotate',
  'scale',
  'transform',
]);
const ARRIVALS = ['ac-pin', 'ac-drop', 'ac-chalk-in', 'ac-chalk-line'];

const keyframes = () => {
  const found: { name: string; props: Set<string> }[] = [];
  for (const file of CSS_FILES)
    postcss
      .parse(readFileSync(file, 'utf8'))
      .walkAtRules(/keyframes$/, (rule) => {
        const props = new Set<string>();
        rule.walkDecls((decl) => {
          props.add(decl.prop);
        });
        found.push({ name: rule.params, props });
      });
  return found;
};

describe('the keyframes of the Academic skin', () => {
  it('never repeat a name: the last one would silently win', () => {
    const names = keyframes().map((k) => k.name);
    expect(names.filter((name, i) => names.indexOf(name) !== i)).toEqual([]);
  });

  it('include those of what arrives on a page', () => {
    const names = keyframes().map((k) => k.name);
    for (const name of ARRIVALS) expect(names).toContain(name);
  });

  it('move what arrives with the compositor only, so the layout never moves', () => {
    for (const { name, props } of keyframes().filter((k) =>
      ARRIVALS.includes(k.name),
    ))
      for (const prop of props)
        expect(COMPOSITOR.has(prop), `${name} animates ${prop}`).toBe(true);
  });

  it('wait for the reduced-motion query: nothing is hidden when it is "reduce"', () => {
    const text = readFileSync(`${DIR}/css/reveal.css`, 'utf8');
    const root = postcss.parse(text);
    let hidden = false;
    root.walkRules((rule) => {
      if (/\[data-reveal\]:not\(\[data-in\]/.test(rule.selector)) {
        hidden = true;
        expect(rule.parent?.type).toBe('atrule');
        expect((rule.parent as postcss.AtRule).params).toContain(
          'prefers-reduced-motion: no-preference',
        );
      }
    });
    expect(hidden).toBe(true);
  });
});
